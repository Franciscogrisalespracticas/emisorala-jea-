# Ejecución de pruebas de navegador

La suite `tests/test_v2_interactions.py` está diseñada para Playwright. En este entorno de construcción, Chromium bloqueó las URLs locales con `ERR_BLOCKED_BY_ADMINISTRATOR`; por eso no se registra un falso PASS.

## Ejecutar en Windows / VS Code

1. Abre el sitio con `ABRIR_LA_JEFA.bat`.
2. En otra terminal:

```bash
pip install playwright
playwright install chromium
set LAJEFA_BASE_URL=http://127.0.0.1:8080
python tests/test_v2_interactions.py
```

El reporte queda en `docs/PLAYWRIGHT_REPORT.json` cuando la ejecución llega a término.
