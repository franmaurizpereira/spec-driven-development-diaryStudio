# Tareas — Objetivo semanal de estudio (002-objetivo-semanal)

En orden de dependencia. Cada tarea cubre 20–30 min.

- [x] T1. Función pura `progresoSemanal` y `lunesDeSemana` + tests (RF-3, RF-4, RF-7, RF-8, RF-9, RF-11)
  Añadir `lunesDeSemana(hoyTexto)` y `progresoSemanal(sesiones, objetivo, hoy)`, y
  exportarlas en `module.exports`. Escribir `test/objetivo-semanal.test.js` con
  fecha fija (HOY = "2026-10-02") cubriendo: objetivo inválido → `hayObjetivo:
  false`; futuras y días previos al lunes no suman; truncado hacia abajo (`119/120`
  → 99); tope al 100 % (`150/120` → 100); cumplido `X >= Y`; X=0; objetivo enorme.
  Hecho cuando: `node --test` queda en verde con esos casos.

- [x] T2. Persistencia del objetivo en `app.js` (RF-9)
  Añadir `CLAVE_OBJETIVO = "diario-estudio-objetivo"`, `guardarObjetivo`,
  `cargarObjetivo` (con `try/catch` y validación de entero positivo → `null` si es
  corrupto) y `quitarObjetivo`. No tocar `diario-estudio-sesiones`.
  Hecho cuando: guardar un entero, recargar y leerlo devuelve ese entero; un valor
  corrupto (texto, 0, decimal) devuelve `null` sin romper.

- [x] T3. Bloque del objetivo en `index.html` (RF-1, RF-4, RNF-3)
  Añadir dentro del hero, tras `.hero-datos`: formulario con campo
  `#objetivo-minutos` (number, min 1, step 1) y botón "Guardar objetivo", párrafo
  de error `#error-objetivo` (clase `.error`, `aria-live="polite"`, `hidden`),
  texto de progreso `#progreso-objetivo`, barra `#barra-objetivo` con relleno
  `#barra-objetivo-relleno` y botón "Quitar objetivo" (`#quitar-objetivo`, `hidden`).
  Subir `?v=7` en `<script>` y `<link>`. No cambiar otros `id`.
  Hecho cuando: existen los `id` nuevos dentro del hero y los `id` previos quedan intactos.

- [x] T4. Estilos del bloque en `styles.css` (RF-3, RF-7, RNF-2)
  Estilos de `.objetivo` (centrado, sobre el hero), la barra `.barra` y su
  `.barra-relleno` (ancho en %), el texto de progreso y el botón "Quitar objetivo".
  Reutilizar `.error` para el error.
  Hecho cuando: a 360 px no hay desplazamiento horizontal y la barra refleja el
  `ancho` (0–100 %).

- [x] T5. Pintado y handlers del objetivo en `app.js` (RF-1, RF-2, RF-5, RF-6, RF-10, RNF-1, RNF-3, RNF-4)
  En `mostrarDatos`, calcular `progreso = progresoSemanal(cargarSesiones(),
  cargarObjetivo(), hoy)` y pintar: estado vacío (mensaje, sin barra ni botón) o
  "X / Y minutos" + "NN %" + "¡Objetivo cumplido!" si toca, relleno al `ancho`.
  Añadir submit (validar entero >= 1, error inline sin `alert`, guardar y repintar)
  y botón "Quitar objetivo" (borrar y repintar). Limpiar el error al teclear.
  Hecho cuando: fijar, editar y quitar el objetivo repintan el progreso al instante;
  el error inválido aparece inline; X coincide con "Esta semana".

- [x] T6. Verificación final (criterios de finalización de la spec)
  `node --test` en verde, abrir `index.html`, probar fijar/editar/quitar, estados
  vacío y cumplido, consola sin errores y vista móvil. Actualizar `MEMORY.md`.
  Hecho cuando: los 14 criterios de finalización se cumplen y `MEMORY.md` refleja
  la feature terminada.
  Estado: `node --test` 34/34 verde; lógica de UI smoke-testeada con mock (7 checks).
  Verificada en navegador real por el usuario (Firefox): fijar/editar/quitar,
  vacío y cumplido, móvil y consola. Criterios 14/14.
