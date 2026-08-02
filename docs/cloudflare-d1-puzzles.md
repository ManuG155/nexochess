# Puzzles de NexoChess en Cloudflare D1

Este procedimiento mueve el lote inicial de problemas desde el MongoDB local a
Cloudflare D1. El navegador sigue ejecutando el tablero, Stockfish, la sesión y
el progreso; el Worker únicamente devuelve el catálogo y un problema filtrado.

## 1. Crear la base de staging

```powershell
npx wrangler login
npx wrangler d1 create nexochess-puzzles-staging --location=weur
```

Cloudflare devolverá un `database_id`. Debe añadirse a `wrangler.jsonc` con el
binding `PUZZLES_DB` antes de desplegar:

```jsonc
"d1_databases": [
    {
        "binding": "PUZZLES_DB",
        "database_name": "nexochess-puzzles-staging",
        "database_id": "UUID_DEVUELTO_POR_CLOUDFLARE"
    }
]
```

## 2. Generar el archivo SQL

Desde la raíz del repositorio, indicando la descarga oficial `.csv.zst`:

```powershell
$env:PUZZLE_DATABASE_FILE="C:\ruta\lichess_db_puzzle.csv.zst"
$env:PUZZLE_EXPORT_DIRECTORY="$PWD\cloudflare\d1\generated"
New-Item -ItemType Directory -Force $env:PUZZLE_EXPORT_DIRECTORY | Out-Null

docker compose `
  -f compose.yaml `
  -f compose.puzzles-import.yaml `
  run --rm --build app `
  npm run export:puzzles:d1 -- `
  /imports/lichess_db_puzzle.csv.zst `
  /exports/nexochess-puzzles.sql `
  --limit=50000
```

El exportador recorre la base completa mediante streaming, conserva cobertura
por tema, dificultad y apertura, calcula el SHA-256 de la fuente y genera
sentencias individuales o lotes pequeños para no superar el límite de longitud
de D1.

## 3. Importar en D1

```powershell
npx wrangler d1 execute nexochess-puzzles-staging `
  --remote `
  --file=cloudflare/d1/generated/nexochess-puzzles.sql
```

Cloudflare admite importaciones SQL mediante `wrangler d1 execute --file`. La
base queda bloqueada durante la importación y el proceso es reintentable si
falla antes de completarse.

## 4. Verificar

```powershell
npx wrangler d1 execute nexochess-puzzles-staging `
  --remote `
  --command="SELECT count, imported_at FROM puzzle_catalogue WHERE id = 1;"
```

El resultado esperado para el primer despliegue es `50000`.

Después del despliegue del Worker deben responder:

- `/api/public/puzzles/catalogue`
- `/api/public/puzzles/next?category=all&difficulty=adaptive&rating=1500&attempts=0`

La base de producción se creará por separado al promover `develop` a `master`.
