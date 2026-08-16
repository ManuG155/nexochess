param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$environments = @{
    staging = @{
        Origin = "https://nexochess-staging.manuel-garcia-villaescusa.workers.dev"
        PuzzleOrigin = "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev"
    }
    production = @{
        Origin = "https://www.nexochess.com"
        PuzzleOrigin = "https://nexochess-puzzle-data-production.manuel-garcia-villaescusa.workers.dev"
    }
}

$origin = $environments[$Environment].Origin.TrimEnd("/")
$puzzleOrigin = $environments[$Environment].PuzzleOrigin.TrimEnd("/")
$expectedPuzzles = 6057356

function Invoke-NexoRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSec = 25
    )

    try {
        return Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    }
    catch {
        $response = $_.Exception.Response
        if ($null -ne $response) {
            $statusCode = [int]$response.StatusCode
            $headers = @{}
            foreach ($key in $response.Headers.AllKeys) {
                $headers[$key] = $response.Headers[$key]
            }

            $body = ""
            try {
                $stream = $response.GetResponseStream()
                if ($null -ne $stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $body = $reader.ReadToEnd()
                    $reader.Dispose()
                }
            }
            catch {}

            return [pscustomobject]@{
                StatusCode = $statusCode
                Headers = $headers
                Content = $body
            }
        }

        throw
    }
}

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-HeaderValue {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $value = $Response.Headers[$Name]
    if ($null -eq $value) { return "" }
    return [string]$value
}

function Assert-SecurityHeaders {
    param(
        [Parameter(Mandatory = $true)]$Response,
        [Parameter(Mandatory = $true)][string]$Path
    )

    Assert-True ((Get-HeaderValue $Response "X-Content-Type-Options") -eq "nosniff") "$Path lacks X-Content-Type-Options nosniff."
    Assert-True ((Get-HeaderValue $Response "X-Frame-Options") -eq "DENY") "$Path lacks X-Frame-Options DENY."
    Assert-True ((Get-HeaderValue $Response "Referrer-Policy") -eq "strict-origin-when-cross-origin") "$Path has an unexpected Referrer-Policy."
}

function Assert-Page {
    param([Parameter(Mandatory = $true)][string]$Path)

    $response = Invoke-NexoRequest "$origin$Path"
    Assert-True ($response.StatusCode -eq 200) "$Path returned HTTP $($response.StatusCode)."
    Assert-SecurityHeaders $response $Path
    Write-Host "OK $Path`: HTTP 200 and security headers"
}

function Assert-JavaScript {
    param([Parameter(Mandatory = $true)][string]$Path)

    $response = Invoke-NexoRequest "$origin$Path"
    Assert-True ($response.StatusCode -eq 200) "$Path returned HTTP $($response.StatusCode)."
    $contentType = Get-HeaderValue $response "Content-Type"
    Assert-True ($contentType -match "javascript") "$Path is not JavaScript."
    Assert-True (-not $response.Content.TrimStart().StartsWith("<!DOCTYPE html")) "$Path returned HTML instead of JavaScript."
    Write-Host "OK $Path`: JavaScript bundle available"
}

$pages = @(
    "/",
    "/about",
    "/faq",
    "/analysis",
    "/archive",
    "/lessons",
    "/engine",
    "/puzzles",
    "/settings",
    "/signin",
    "/privacy",
    "/terms",
    "/source",
    "/help"
)

foreach ($path in $pages) {
    Assert-Page $path
}

Assert-Page "/analysis?game=deployment-smoke-test"

$bundles = @(
    "/home.bundle.js?v=deployment-smoke-test",
    "/about.bundle.js",
    "/faq.bundle.js",
    "/lessons.bundle.js",
    "/enginePlay.bundle.js",
    "/settings.bundle.js"
)

foreach ($bundle in $bundles) {
    Assert-JavaScript $bundle
}

$robots = Invoke-NexoRequest "$origin/robots.txt"
Assert-True ($robots.StatusCode -eq 200) "robots.txt did not return HTTP 200."

$sitemap = Invoke-NexoRequest "$origin/sitemap.xml"
if ($Environment -eq "production") {
    Assert-True ($sitemap.StatusCode -eq 200) "Production sitemap did not return HTTP 200."
}
else {
    Assert-True ($sitemap.StatusCode -eq 404) "Non-production sitemap returned HTTP $($sitemap.StatusCode) instead of 404."
}
Write-Host "OK search files: $Environment robots and sitemap policy"

$session = Invoke-NexoRequest "$origin/auth/account/get-session"
Assert-True ($session.StatusCode -eq 200) "Better Auth did not return HTTP 200."
Assert-True ($session.Content.Trim() -eq "null") "Anonymous session response is unexpected."
Write-Host "OK Better Auth anonymous session"

$profile = Invoke-NexoRequest "$origin/api/account/profile"
Assert-True ($profile.StatusCode -eq 401) "Protected profile did not return HTTP 401."
Write-Host "OK protected API isolation"

$unknown = Invoke-NexoRequest "$origin/api/operations/unknown"
Assert-True ($unknown.StatusCode -eq 404) "Unknown API route did not return HTTP 404."
Write-Host "OK public API error handling"

$catalogue = Invoke-NexoRequest "$puzzleOrigin/catalogue.json"
Assert-True ($catalogue.StatusCode -eq 200) "Puzzle catalogue is unavailable."
$catalogueJson = $catalogue.Content | ConvertFrom-Json
Assert-True ([int64]$catalogueJson.count -eq $expectedPuzzles) "Puzzle catalogue contains $($catalogueJson.count) instead of $expectedPuzzles."
Write-Host "OK puzzle data: 6.057.356 puzzles"

Write-Host ""
Write-Host "$($Environment.ToUpper()) DEPLOYMENT VERIFICATION PASSED"
Write-Host $origin
