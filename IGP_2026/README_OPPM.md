# Dashboard de auditoría ISO IGP — entrega para OPPM

El archivo `salidas/administracion/Dashboard_IGP_Institucional.html` contiene los 112 registros reales. Su vista inicial muestra los 99 del SGC. La consulta funciona con doble clic, sin internet ni instalaciones. El maestro y este paquete completo se destinan exclusivamente al personal autorizado de OPPM / administración del SIG.

## Qué compartir

Consulte `INDICE_DE_ENTREGA.csv`, identifique el proceso exacto y comparta únicamente su archivo `salidas/auditados/.../Dashboard_Auditoria_....html`, acompañado de `INSTRUCCIONES_PARA_EL_AUDITADO.txt`. Cada HTML incluye solo sus registros y las acciones y validaciones relacionadas. No necesita copiar ninguna otra carpeta. Los filtros no son seguridad: quien recibe un HTML puede inspeccionar todos sus registros incorporados.

Los archivos de proceso parten de la vista SGC. Si contienen registros de otros sistemas, ofrecen «Todos los registros de este ámbito», sin acceder a otros procesos. Antes de distribuir, OPPM debe autorizar el contenido completo del archivo, no solamente la vista inicial.

No se han enviado correos ni publicado archivos. Use un canal institucional con permisos. El índice, el registro de validaciones, la fuente, las capturas y el ejemplo de impresión pertenecen al paquete de administración, no a una distribución indiscriminada.

## Fuente y reglas

- Fuente: `fuente_administracion/Fuente_Dashboard_ISO_IGP_2026.xlsx`, recuperada del archivo Excel del mismo nombre en el Drive conectado. Se conserva el binario utilizado para reproducir la generación.
- Corte documental: 22/10/2026. La fecha de generación es distinta y figura en cada HTML.
- Clave: `id_registro`. Los 202 segmentos de acciones son auxiliares; no son registros ni acciones con avance verificado.
- Las nueve hojas están presentes. Solo se incorporan REGISTROS, ACCIONES_2025 y VALIDACIONES del ámbito; criterios y definiciones genéricos. No se incrustan copias globales de las hojas originales ni catálogos globales en los archivos de proceso.
- Los campos oficiales se conservan completos, incluidos saltos de línea, vacíos y booleanos. Los textos de celdas se renderizan como texto, nunca como HTML ejecutable.
- Los nombres «Operaciones y Mantenimiento (volcanes)» y «Operaciones y Mantenimiento (VOLCANES)» se mantienen separados: hay 17 ámbitos exactos. Para unificarlos, OPPM debe corregir/autorizar la denominación en la fuente y regenerar.
- Las oportunidades con rótulos de riesgo se señalan como inconsistentes y se excluyen de indicadores exclusivos de riesgos. No se calcula avance de acciones ni se afirma conformidad ISO.
- Eficacia vacía o «-» se agrupa como «Sin evaluación»; el valor original permanece en la ficha. «No aplica» se conserva separado. Las fechas de cumplimiento se contrastan con el corte explícito, no con el reloj del navegador.
- El nivel 2026 usa la clasificación validada de la fuente. Los criterios se muestran para consulta de la evaluación inicial; no convierten el puntaje inicial en nivel residual.
- La exportación CSV contiene solo los resultados filtrados. Para prevenir fórmulas al abrirlo en una hoja de cálculo, se antepone apóstrofo a celdas que empiezan por símbolos de fórmula; la ficha y los datos incrustados conservan el texto original.

## Regenerar localmente (solo administración)

Se requiere Python 3.10 o posterior y `openpyxl` 3.1.x. El auditado no requiere estos componentes. Mantenga `generar_dashboards.py` junto con `dashboard_template.html`.

```text
python -m pip install "openpyxl>=3.1,<4"
python generar_dashboards.py fuente_administracion/Fuente_Dashboard_ISO_IGP_2026.xlsx --salida entrega_2026_10_23_v2 --corte 2026-10-22
```

El generador solo lee el Excel local; no consulta URLs. Imprime errores de lectura, encabezados, tipos, IDs, relaciones o fórmulas sin resultado y no declara éxito en esos casos. Elija una carpeta nueva: rechaza destinos que ya contienen archivos. Una ejecución fallida puede dejar una carpeta parcial que no debe distribuirse. Las discrepancias frente a los controles históricos se notifican expresamente en consola y en `VALIDACIONES_GENERACION.json`; prevalecen los datos reales.

Para un ámbito opcional expresamente autorizado, agregue `--unidad "nombre exacto"`, `--proceso "nombre exacto"` o ambos. Además de los archivos estándar, se produce `salidas/ambito_seleccionado/Dashboard_Auditoria_Ambito.html`. No se generaron ámbitos opcionales en esta entrega. Verifique el contenido antes de distribuir.

El índice relaciona nombres completos con códigos cortos y estables derivados del nombre exacto. El límite de longitud permite abrir y extraer las rutas en Windows. SHA-256 identifica el Excel usado; no es una firma digital ni una certificación de autenticidad.

## Validaciones realizadas

Los 13 controles coinciden con la referencia: 112 = 95 riesgos + 17 oportunidades; 99 SGC = 86 + 13; marcas CENSIS 77 y CENVUL 63; riesgos SGC: 30 bajos, 55 moderados, 1 alto y 0 críticos; 202 segmentos auxiliares. No se suma el solapamiento CENSIS/CENVUL.

`VALIDACIONES_GENERACION.json` contiene conteos, huella, metadatos y los IDs autorizados por archivo. `PRUEBAS_NAVEGADOR.json` documenta apertura directa `file://` con Chrome en modo offline, búsqueda, filtros, navegación, CSV, vista móvil, 17 ámbitos sin IDs ajenos y cero solicitudes de red/errores JavaScript. El modo offline se impuso al contexto de navegador; no se desconectó físicamente la red del equipo.

Se probaron las fichas IGP-033 (riesgo alto, eficacia No), IGP-008 (oportunidad inconsistente) e IGP-097 (control inadecuado). `revision_visual` incluye capturas de escritorio, móvil, ficha y un PDF A4 de ejemplo con textos íntegros. El PDF es un ejemplo de impresión, no otro sistema de consulta.

Para repetir pruebas de navegador, use Node.js, el paquete Playwright y Chrome instalado:

```text
node probar_dashboard.cjs ruta_a_la_carpeta_generada
```

Puede indicar `PLAYWRIGHT_MODULE` con la ubicación del módulo y `BROWSER_CHANNEL=msedge` para Microsoft Edge. Las dependencias de pruebas no se cargan desde los HTML. Las pruebas de esta versión incluyen controles específicos de la fuente de referencia; ajuste sus expectativas tras un cambio autorizado de datos. Para comprobar el lector y los controles de generación, ejecute:

```text
python pruebas_generador.py fuente_administracion/Fuente_Dashboard_ISO_IGP_2026.xlsx
```

Para consultar información actualizada, el auditado debe solicitar a OPPM una nueva versión del dashboard.
