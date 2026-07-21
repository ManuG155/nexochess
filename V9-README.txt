WintrChess Classification V9 - Multi-Game
==========================================

Base: V8 Stable.

Goal:
Reduce overfitting to the Marta benchmark by applying only structural fixes
supported by both the Marta and acgoody validation games.

Changes:
1. Book: early immediate recaptures can stay in theory through ply 8.
2. Best: PV1 must also pass a small post-position EP verification loss <= 0.008.
3. Miss: more conservative multi-game A/B/C rules with line-gap and baseline checks.
4. Miss override: Best/Excellent moves are not stolen by Miss.
5. Great: critical captures are allowed; obvious immediate non-pawn recaptures are not.
6. Free captures need a stronger 0.12 EP second-line gap to become Great.

Unchanged:
- Accuracy V2
- Game Rating V5
- Standard V5 EP-loss calibration
- Brilliant detector
- Serialization / engine line count

Files to replace:
- shared/src/lib/reporter/classify.ts
- shared/src/lib/reporter/classification/critical.ts
- shared/src/lib/reporter/classification/miss.ts
- shared/src/lib/reporter/classification/pointLoss.ts
- shared/src/lib/reporter/classification/classificationExpectedPoints.ts
