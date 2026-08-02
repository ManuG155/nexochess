# Los 6.057.356 puzzles como recursos estáticos de Cloudflare

NexoChess no almacena la base completa de puzzles en D1. Los documentos se
exportan una sola vez desde el MongoDB restaurado a paquetes estáticos y a
índices compactos. El navegador descarga únicamente el índice y el paquete que
necesita para el problema actual.

## Arquitectura

- `data/*.json`: paquetes base de 5.000 puzzles, almacenados una sola vez.
- `indexes/*/*.json`: punteros compactos por tema, apertura, categoría y nivel.
- `catalogue.json`: catálogo de filtros, cantidades y paquetes.
- `_headers`: CORS y caché de larga duración.

El exportador aborta antes del despliegue si genera más de 19.000 archivos o si
algún archivo supera 24 MiB. Estos márgenes quedan por debajo de los límites del
plan gratuito de Workers Static Assets.

## Exportar desde el MongoDB de staging

La salida se guarda fuera de OneDrive para evitar que intente sincronizar miles
de archivos. Docker monta la carpeta padre en `/exports`; el exportador solo
reemplaza `/exports/puzzle-static-dist`, nunca la raíz del volumen.

```powershell
$developPath = "C:\Users\manue\OneDrive\Documentos\proyectos\chess\nexochess-develop"
$exportRoot = "C:\NexoChessData"
$outputPath = Join-Path $exportRoot "puzzle-static-dist"

Set-Location $developPath
New-Item -ItemType Directory -Force $exportRoot | Out-Null
$env:PUZZLE_STATIC_EXPORT_ROOT = $exportRoot

docker compose `
    -f compose.staging.yaml `
    -f compose.puzzles-static-export.yaml `
    run --rm --build app `
    npm run export:puzzles:static -- /exports/puzzle-static-dist
```

El resultado válido termina con `STATIC PUZZLE EXPORT COMPLETED` y debe indicar
exactamente 6.057.356 puzzles.

Para que Wrangler vea la salida sin duplicarla dentro de OneDrive, se crea una
unión de directorio desde el repositorio:

```powershell
$linkPath = Join-Path $developPath "puzzle-static-dist"

if (Test-Path $linkPath) {
    throw "Ya existe $linkPath. Revísalo antes de crear la unión."
}

New-Item -ItemType Junction -Path $linkPath -Target $outputPath | Out-Null
```

## Desplegar el almacén estático

```powershell
npx wrangler deploy -c wrangler.puzzle-data.jsonc
```

Este despliegue es independiente del Worker principal de NexoChess. Las futuras
compilaciones de `develop` no eliminan ni vuelven a subir la base de puzzles.

## Datos dinámicos

La base D1 creada durante la preparación no se usa para almacenar los puzzles.
Se reserva para cuentas, sesiones, Archivo y progreso sincronizado.
