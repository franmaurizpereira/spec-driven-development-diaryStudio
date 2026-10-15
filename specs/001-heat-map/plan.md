# Plan — Mapa de calor de estudio (001-heat-map)

## Archivos y responsabilidades
- `app.js` (modifica): solo añade lógica pura del mapa y su pintado en `mostrarDatos`.
No toca rachas, totales ni validaciones. Cubre RF-1–RF-8.
- `index.html` (modifica): añade la sección del mapa (`mapa-dias`, `detalle-dia`)
entre el héroe y el formulario. Sin cambios de lógica. Cubre RF-1, RF-6, RF-8.
- `styles.css` (modifica): rejilla 8×7, niveles 0–4 y estilo atenuado de futuros.
Cubre RF-3, RF-4, RF-5, RNF-2.
- `test/mapa-calor.test.js` (crea): tests `node --test` de la lógica pura.
- `app.js?v=` y `styles.css?v=` (sube versión): evita caché `file://`.

## Funciones puras (todas reciben "hoy" como texto "AAAA-MM-DD")
- `totalesPorDia(sesiones)` → `{ fecha: minutos }`. Cubre RF-2, RF-7.
- `lunesInicioMapa(hoy)` → lunes de hace 7 semanas. Cubre RF-1.
- `diasVentanaMapa(hoy)` → 56 textos de lunes a domingo. Cubre RF-1.
- `nivelIntensidad(total, maximo)` → 0–4 con `ceil(total / maximo * 4)`. Cubre RF-3.
- `datosMapaCalor(sesiones, hoy)` → `[{ fecha, total, futura, nivel }]`; el máximo
excluye futuros. Cubre RF-3, RF-4, RF-5, RF-7.
- `detalleDia(sesiones, fecha, hoy)` → texto del detalle o `null` si es futuro.
Cubre RF-6, RF-7, RF-8.

## Algoritmo (pseudocódigo)
```
totales = totalesPorDia(sesiones)
dias = diasVentanaMapa(hoy)
maximo = mayor total entre los dias <= hoy
para cada dia en dias:
  si dia > hoy: celda atenuada, sin nivel, no pulsable        (RF-5)
  si no: nivel = nivelIntensidad(totales[dia] o 0, maximo)    (RF-3, RF-4)
al pulsar un dia no futuro:
  si tiene sesiones: "fecha: X min — tema1, tema2"            (RF-6)
  si no: "fecha: sin sesiones"                                (RF-8)
al guardar una sesión se repinta el mapa con mostrarDatos     (RNF-4)
```

## Pintado en la interfaz
- 56 `<button type="button">` en `.mapa-dias` (CSS grid por columnas semanales),
clases `nivel-0`…`nivel-4` más `futura`; futuros con `disabled`. (RF-1, RF-3, RF-5)
- Cada día lleva `aria-label` ("fecha: X minutos" / "sin sesiones" / "día futuro").
(RNF-3)
- El detalle vive en `#detalle-dia` con `aria-live="polite"` y texto inicial que
invita a pulsar. (RF-6, RF-8, RNF-1)
- Columnas `1fr`: sin desplazamiento horizontal en móvil. (RNF-2)

## Decisiones (y alternativa descartada)
- 5 niveles fijos 0–4 con `ceil`: la spec pedía "proporcional" sin fórmula; 5 pasos
se distinguen en móvil. Descartado: escala continua (ilegible la diferencia) y
umbrales fijos de minutos (la spec los excluye).
- Detalle en párrafo bajo el mapa: simple y accesible. Descartado: modal o tooltip
(más código y foco que gestionar).
- Futuros como botones `disabled`: visibles pero no pulsables. Descartado: celdas
`div` no interactivas (el lector las anunciaría distinto y RF-5 pide atenuar, no
ocultar).
- Reutilizar `restarDias` (incluso con días negativos para avanzar): sin ayudantes
nuevos. Descartado: función aparte de sumar días.
- `app.js` importable en node con guardia `ES_NAVEGADOR` y `?.`: mantiene los 3
ficheros del proyecto. Descartado: extraer la lógica a un segundo `.js` (rompe la
estructura y exige otro `<script>`).
- Identificadores nuevos en español como el resto de `app.js`, aunque la
constitución pide código en inglés: renombrar todo el fichero sería reescribir.

## Tests (`node --test`, sin paquetes)
- Fecha fija (`HOY = "2026-10-02"`) para resultados deterministas.
- Ventana: 56 días, empieza lunes `2026-08-10`, termina domingo `2026-10-04`. (RF-1)
- Suma de varias sesiones del mismo día. (RF-2)
- Niveles: máximo→4, mitad→2, cero→0, periodo vacío→todo 0. (RF-3, RF-4)
- Futura con 999 min: no eleva el máximo, sale atenuada sin nivel. (RF-5, RF-7)
- Detalle con temas, vacío ("sin sesiones") y futuro (`null`). (RF-6, RF-8)
- `restarDias` cruza de mes en hora local. (RF-7)

## Nota para la spec
El plan fija lo que la spec dejó abierto: 5 niveles con `ceil`, 56 celdas en orden
cronológico y temas únicos en orden de aparición. Conviene volcarlo a RF-3/RF-6.
