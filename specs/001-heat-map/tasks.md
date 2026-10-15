# Tareas — Mapa de calor de estudio (001-heat-map)

En orden de dependencia. Cada tarea cubre 20–30 min.

- [x] T1. Ventana y agregación puras + hacer `app.js` importable en node (RF-1, RF-2, RF-7)
  Añadir `totalesPorDia`, `lunesInicioMapa`, `diasVentanaMapa`; guardia
  `ES_NAVEGADOR`, `?.` en listeners y `module.exports`.
  Hecho cuando: `node --test` importa `app.js` y la ventana da 56 días de lunes a domingo.
- [x] T2. Intensidad y datos del mapa + tests (RF-3, RF-4, RF-5, RF-7)
  Añadir `nivelIntensidad` (0–4 con `ceil`) y `datosMapaCalor` (máximo sin futuros).
  Hecho cuando: máximo→4, mitad→2, cero→0, periodo vacío→todo 0 y futura con 999 min no eleva el máximo.
- [x] T3. Texto del detalle + tests (RF-6, RF-7, RF-8)
  Añadir `detalleDia` (fecha, minutos y temas únicos; "sin sesiones"; `null` si futuro).
  Hecho cuando: los 3 casos tienen test en verde con fecha fija.
- [x] T4. Sección del mapa en `index.html` (RF-1, RF-6, RF-8)
  Añadir la sección entre héroe y formulario con `mapa-dias` y `detalle-dia`, y subir `?v=`.
  Hecho cuando: existen los dos `id` y no se toca ningún otro `id` existente.
- [x] T5. Estilos del mapa en `styles.css` (RF-3, RF-4, RF-5, RNF-2)
  Rejilla 8×7 con columnas `1fr`, niveles 0–4 y futuros atenuados con borde discontinuado.
  Hecho cuando: a 360 px no hay desplazamiento horizontal y cada nivel se distingue.
- [x] T6. Pintado en `mostrarDatos` + repintado al guardar (RF-1, RF-3, RF-4, RF-5, RF-6, RF-8, RNF-3, RNF-4)
  56 botones con `aria-label`, futuros `disabled`, clic que escribe el detalle.
  Hecho cuando: pulsar un día muestra su detalle y guardar una sesión repinta el mapa.
- [x] T7. Verificación final (criterios de finalización de la spec)
  `node --test` en verde, abrir `index.html`, probar pulsaciones, consola sin errores y vista móvil.
  Hecho cuando: los 5 criterios de finalización se cumplen y `MEMORY.md` queda actualizado.
