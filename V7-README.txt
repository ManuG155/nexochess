WintrChess Classification V7 Debug/Calibration Pack

Changes:
- Preserves Classification V6 standard labels.
- Preserves Accuracy V2 and Game Rating V5.
- Miss V7 lowers only the critical-route floor 0.045 -> 0.043 to recover confirmed 24.dxe5 after V6 stabilisation.
- Adds full Classification Debugger in Game Summary.
- Debugger exposes Raw/Same-search/Verification/Calibrated losses, phase, top-move status, MultiPV index, line1-line2 gap and material.

Install by extracting into the WintrChess repository root and replacing existing files.
Then run:
  npm run build -w shared
  npm run check -w client
  docker compose up -d --build
