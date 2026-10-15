# Plan — Objetivo semanal de estudio (002-objetivo-semanal)

## Archivos y responsabilidades
- `app.js` (modifica): añade la constante `CLAVE_OBJETIVO`, las funciones puras
  `lunesDeSemana` y `progresoSemanal`, las funciones de persistencia
  `cargarObjetivo`/`guardarObjetivo`/`quitarObjetivo`, los elementos del bloque, el
  pintado en `mostrarDatos` y los handlers de guardar/quitar. Exporta
  `lunesDeSemana` y `progresoSemanal`. No toca rachas, mapa ni el total del hero.
  Cubre RF-1–RF-11.
- `index.html` (modifica): añade el bloque del objetivo dentro del hero, después de
  `.hero-datos` (junto a "Esta semana"), y sube `?v=7` en `<script>` y `<link>`.
  Cubre RF-1, RF-4, RNF-3.
- `styles.css` (modifica): estilos del bloque `.objetivo`, la barra `.barra` y su
  relleno, el texto de progreso y el botón "Quitar objetivo". Reutiliza `.error`.
  Cubre RF-3, RF-7, RNF-2.
- `test/objetivo-semanal.test.js` (crea): tests `node --test` de la lógica pura.

## Función pura: `progresoSemanal(sesiones, objetivo, hoy)`
- Entrada: `sesiones` (array con `fecha` y `minutos`), `objetivo` (lo que devuelva
  `cargarObjetivo`: un entero positivo o `null`), `hoy` (texto "AAAA-MM-DD").
- Si `objetivo` no es `Number.isInteger(objetivo) && objetivo >= 1`, devuelve
  `{ hayObjetivo: false }` (cubre valores corruptos, RF-9, y estado vacío, RF-4).
- Si es válido: deriva el lunes con `lunesDeSemana(hoy)`; suma `minutos` de las
  sesiones con `fecha >= lunes && fecha <= hoy` (futuras excluidas, RF-8); calcula
  `porcentaje = Math.min(100, Math.floor((x / objetivo) * 100))` (truncado hacia
  abajo, RF-3/RF-7); y devuelve
  `{ hayObjetivo: true, minutos: x, objetivo, porcentaje, ancho: porcentaje,
  cumplido: x >= objetivo }`.
- No usa `new Date()` sin argumentos, ni DOM, ni localStorage (pureza, RF-11).

## Función pura auxiliar: `lunesDeSemana(hoyTexto)`
- Devuelve el lunes de la semana de `hoyTexto` como "AAAA-MM-DD", con la misma
  técnica que `lunesInicioMapa`: partir el texto, construir `new Date(año, mes-1,
  día)` local, `diasDesdeLunes = (getDay() + 6) % 7` y `restarDias(hoyTexto,
  diasDesdeLunes)`. Es pura y reutiliza `restarDias`.

## Integración con la lógica existente
- `hoyLocal`, `inicioSemanaLocal` y `calcularMinutosSemana` se quedan como están y
  siguen alimentando el número "Esta semana" del hero (lógica impura, solo UI).
- `progresoSemanal` calcula X con la misma ventana lunes–hoy que
  `calcularMinutosSemana`, por lo que ambos coinciden (RNF-4). No se parametriza
  `calcularMinutosSemana` para no reescribir código que ya funciona.

## Persistencia (`localStorage`, clave nueva)
- `CLAVE_OBJETIVO = "diario-estudio-objetivo"`. No se toca
  `diario-estudio-sesiones`.
- `guardarObjetivo(objetivo)`: `JSON.stringify(objetivo)` de un entero positivo.
- `cargarObjetivo()`: lee, `JSON.parse` dentro de `try/catch`; si no es un entero
  positivo devuelve `null` (corrupto → "sin objetivo", RF-9).
- `quitarObjetivo()`: `localStorage.removeItem(CLAVE_OBJETIVO)` (RF-6).

## Pintado en la interfaz (`mostrarDatos` y handlers)
- En `mostrarDatos`, tras calcular `hoy`: `objetivo = cargarObjetivo()` y
  `progreso = progresoSemanal(cargarSesiones(), objetivo, hoy)`.
- Sin objetivo (`!progreso.hayObjetivo`): se muestra el mensaje vacío ("Fija un
  objetivo semanal para medir tu progreso."), se ocultan la barra y el botón
  "Quitar objetivo" y se limpia el texto de progreso (RF-4).
- Con objetivo: se rellena el campo con el valor guardado; se muestra
  "X / Y minutos", el porcentaje "NN %" y, si `cumplido`, "¡Objetivo cumplido!";
  el relleno de la barra toma `width = ancho + "%"` (nunca > 100 %); se muestra el
  botón "Quitar objetivo" (RF-3, RF-7).
- Submit del formulario de objetivo: valida entero >= 1; si es inválido muestra
  error inline en `#error-objetivo` (clase `.error`, `aria-live="polite"`, no
  `alert`) y mantiene el objetivo anterior (RF-5); si es válido, `guardarObjetivo`
  y repinta (RF-1, RF-2, RF-10).
- Botón "Quitar objetivo": `quitarObjetivo()` y repinta (RF-6, RF-10).

## Decisiones (y alternativa descartada)
- Función pura nueva (`progresoSemanal` + `lunesDeSemana`) en vez de parametrizar
  `calcularMinutosSemana(sesiones, hoy)`: parametrizarla obliga a tocar también
  `inicioSemanaLocal` y reescribir código del total ya verificado. Descartado.
- `lunesDeSemana` como ayudante puro separado (aunque `lunesInicioMapa` repite la
  misma matemática): testeable y legible sin refactorizar el mapa de calor.
- Objetivo guardado como JSON de un número, con `try/catch`: coherente con cómo se
  guardan las sesiones. Descartado: string plano (más conversiones manuales).
- Reutilizar `.error` para el error del objetivo aunque el hero sea oscuro: el
  fondo claro `--error-fondo` y el texto `--error-texto` siguen siendo legibles;
  no hace falta un estilo nuevo. Descartado: variante de error para tema oscuro.
- No se parametriza el total del hero: `calcularMinutosSemana` y `progresoSemanal`
  comparten la regla lunes–hoy, así que X coincide sin tocar ese código.

## Tests (`node --test`, sin paquetes)
Fecha fija `HOY = "2026-10-02"` (viernes); lunes de esa semana = `"2026-09-28"`.
- RF-11/estado vacío y RF-9/corrupto: `objetivo` en `null`, `0`, `-5`, `1.5`,
  `"abc"`, `NaN` → `{ hayObjetivo: false }`.
- RF-8/futuras y ventana: sesiones el lunes (`2026-09-28`, 30 min) y el martes
  (`2026-09-29`, 20 min) suman 50; una futura (`2026-10-03`, 999 min) no suma; una
  del domingo anterior (`2026-09-27`) tampoco.
- RF-3/porcentaje: `50 / 120` → `porcentaje 41`, `ancho 41`, `cumplido false`;
  `119 / 120` → `99` (no `100`); `120 / 120` → `100` y `cumplido true`; `150 / 120`
  → `100` (tope) y `cumplido true`.
- RF-7/cumplido y caso X=0: sin sesiones con objetivo → `minutos 0`, `porcentaje 0`,
  `cumplido false`.
- Objetivo muy grande: `10 / 100000` → `porcentaje 0` (sin cota superior).
- `lunesDeSemana`: `lunesDeSemana(HOY) === "2026-09-28"`; cruza de mes con
  `lunesDeSemana("2026-10-01")`.

## Riesgos y mitigación
- Caché de JS/CSS con `file://`: subir `?v=7` en `<script>` y `<link>`.
- `JSON.parse` sobre valor corrupto lanza excepción: `try/catch` devuelve `null`.
- `Number(s.minutos)` con minutos no numéricos: mismo comportamiento que el total
  actual (las sesiones ya se validan al guardar); no se añade lógica nueva.
- No usar `alert` en el error del objetivo y no tocar `diario-estudio-sesiones`.
- Móvil: la barra usa `width` en % y el formulario se apila, sin scroll horizontal.
