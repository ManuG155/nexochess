param(
    [switch]$Apply
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path (Split-Path -Parent $root) "nexochess-local-backup-$timestamp"

$targets = @(
    "wintrchess-review.zip",
    "wintrchess-ui-current.zip",
    "wintrchess-v9-current.zip",
    "git-diff.patch",
    "git-diff-current.patch",
    "git-status.txt",
    "git-status-current.txt",
    "PATCH-MANIFEST.json",
    "PATCH-NOTES.txt",
    "V7-README.txt",
    "V8-README.txt",
    "V9-README.txt",
    "wintrchess-openings-v2",
    "wintrchess-review-movelist-v3-pack"
)

$existing = foreach ($target in $targets) {
    $path = Join-Path $root $target
    if (Test-Path -LiteralPath $path) {
        [PSCustomObject]@{ Target = $target; Path = $path }
    }
}

if (-not $existing) {
    Write-Host "No known local artefacts were found. Nothing to clean." -ForegroundColor Green
    exit 0
}

Write-Host "The following local artefacts are not suitable for the public repository:" -ForegroundColor Yellow
$existing.Target | ForEach-Object { Write-Host "  - $_" }

if (-not $Apply) {
    Write-Host ""
    Write-Host "Preview only. Nothing was changed." -ForegroundColor Cyan
    Write-Host "Run this command to move them to a backup folder outside the repository:" -ForegroundColor Cyan
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\prepare-public-repository.ps1 -Apply"
    exit 0
}

New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach ($item in $existing) {
    $destination = Join-Path $backup $item.Target
    $destinationParent = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    Move-Item -LiteralPath $item.Path -Destination $destination -Force
    Write-Host "Moved $($item.Target)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backup created at: $backup" -ForegroundColor Green
Write-Host "Run npm run check:repository before committing." -ForegroundColor Green
