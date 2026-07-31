# Base completa de problemas de NexoChess

NexoChess almacena la exportación completa de problemas en la colección
persistente `puzzles` de MongoDB. El navegador solo descarga el catálogo de
temas y un problema cada vez.

## Primera importación

Ejecuta estos comandos desde la raíz del proyecto en PowerShell. Sustituye la
ruta por la ubicación real de `lichess_db_puzzle.csv.zst`.

```powershell
$env:PUZZLE_DATABASE_FILE = "C:\ruta\lichess_db_puzzle.csv.zst"
docker compose build --no-cache app
docker compose run --rm --entrypoint zstd app --version
docker compose -f compose.yaml -f compose.puzzles-import.yaml run --rm app npm run import:puzzles -- /imports/lichess_db_puzzle.csv.zst --limit=1000
docker compose -f compose.yaml -f compose.puzzles-import.yaml run --rm app npm run import:puzzles -- /imports/lichess_db_puzzle.csv.zst
docker compose up -d --build
```

La comprobación de Zstandard debe imprimir su versión. La primera ejecución del
importador debe empezar por `NexoChess puzzle importer v3`; importa únicamente
1.000 problemas y comprueba el archivo, la descompresión, el formato CSV y
MongoDB en pocos segundos. Si finaliza con `Import complete: 1,000 puzzles`,
ejecuta la importación completa de la línea siguiente.

La web que ya está publicada mediante Cloudflare Tunnel continúa funcionando
durante la importación. El importador escribe primero en `puzzlesImport`, crea
los índices y solo sustituye la colección activa cuando todo ha terminado.

## Comprobación

```powershell
docker compose exec database mongosh wintrchess --quiet --eval "db.puzzles.estimatedDocumentCount()"
docker compose exec database mongosh wintrchess --quiet --eval "db.puzzleMetadata.findOne({_id:'catalogue'},{count:1,themes:1,openingTags:1,importedAt:1})"
```

El primer comando debe devolver `6057356` para la exportación comprobada el 30
de julio de 2026. La cifra cambiará si en el futuro se importa una exportación
más reciente.

## Actualizaciones futuras

Descarga la nueva exportación oficial, cambia `PUZZLE_DATABASE_FILE` y repite
los tres comandos. Una importación fallida no elimina la colección activa.
