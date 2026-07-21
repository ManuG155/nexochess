WintrChess Classification V8 Stable

This pack is intended to replace the current V7 debug/calibration state.

Included changes:
- Restore V5 standard classification calibration.
- Restore V5 exact-top-move Best behaviour.
- Restore Miss V4 detector (removes the later V7 threshold tweak).
- Keep V6 monotonic Book grace logic.
- Keep V6 Great detector (0.075 EP second-line gap).
- Restore StateTreeNode serialization to 2 engine lines.
- Remove temporary Miss and Classification debugger UI/code from Game Summary.
- Accuracy V2 and Game Rating V5 are not modified.

Install by extracting this ZIP into the WintrChess repository root and replacing existing files.
Then run:
  npm run build -w shared
  npm run check -w client
  docker compose up -d --build
