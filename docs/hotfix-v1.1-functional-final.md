# Hotfix funcional v1.1

Este hotfix cierra cuatro regresiones observadas directamente en producción después de v1.1:

1. **Acceso a Análisis**: la navegación interna usa una ruta técnica de recuperación que sirve la aplicación de Análisis directamente, limpia caché HTTP obsoleta y restaura la URL canónica `/analysis` antes de montar React.
2. **Motor en variantes de Review**: el cálculo en tiempo real ya no depende de la pestaña heredada `AnalysisTab.REPORT`; Stockfish permanece activo mientras se revisa una partida y una variante recibe líneas, clasificación y actualización del entrenador.
3. **Barra de Puzzles**: cada FEN visible usa un Worker limpio de Stockfish Lite; el wrapper UCI espera `uciok` y `readyok` antes de buscar. Una transición material no nula puede mostrarse de inmediato, sin forzar posiciones igualadas a un falso 0.0.
4. **Flechas manuales de Puzzles**: el gesto de botón derecho se intercepta antes de `react-chessboard`; tanto pistas como flechas manuales pasan por `SuggestionArrowOverlay`, que representa desplazamientos de caballo mediante geometría en L.

La verificación `verify:core-hotfix` protege estas garantías en CI. La validación definitiva sigue siendo funcional sobre producción después del despliegue, antes de continuar con el Paso 34.
