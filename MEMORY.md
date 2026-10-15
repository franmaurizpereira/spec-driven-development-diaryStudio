# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- coordinator como agente primario (`default_agent: coordinator` en `opencode.json`).
- 001-heat-map CUMPLIDA: mapa de calor 8 semanas. Lógica 9/9 en verde + interfaz
  verificada por el usuario en navegador.
- 002-objetivo-semanal CUMPLIDA: objetivo semanal en el hero. Lógica 34/34 en verde;
  UI verificada por el usuario en Firefox (fijar/editar/quitar, vacío y cumplido,
  móvil y consola). Criterios 14/14 y T1–T6 cerradas.
## Decisiones (y por qué)
- `progresoSemanal(sesiones, objetivo, hoy)` y `lunesDeSemana(hoy)` puras: reciben "hoy"
  y se prueban con `node --test`. Ventana lunes–hoy idéntica a la del total semanal,
  por eso X coincide con "Esta semana" (RNF-4).
- Objetivo en clave nueva `diario-estudio-objetivo` (JSON de un entero; `null` si es
  corrupto/no válido). No toca `diario-estudio-sesiones` (compatibilidad hacia atrás).
- `novalidate` en `form-objetivo`: sin él, `required`/`min`/`step` bloquean el submit
  con la burbuja nativa y el error inline de RF-5 nunca llegaría a mostrarse.
- Barra topeada al 100 % y porcentaje truncado hacia abajo (`Math.floor`), nunca "100 %"
  antes de cumplir.
- Sin backend ni dependencias: se abre con doble clic (`file://`). Variables `:root` y
  2 pilas (Georgia para titulares, system-ui para cuerpo): sin fuentes externas.
## Aprendizajes y errores a evitar
- Nunca UTC ni `new Date("AAAA-MM-DD")`; comparar fechas como texto (`fecha > hoyLocal()`).
- No borrar sesiones futuras guardadas: se ocultan y aparecen al llegar su día.
- En el objetivo no usar `alert`: error inline en `#error-objetivo` (`.error` + `aria-live`).
- El `input` global hereda color claro dentro del hero sobre fondo blanco (ilegible);
  se corrigió con `.objetivo input { color: var(--tinta) }`, sin tocar la regla global.
- Con `file://` el navegador cachea JS/CSS: subir `?v=N` al cambiar (script y link en v8).
## Próximos pasos
- Verificar 002 en un navegador real (Chrome): fijar/editar/quitar, estados vacío y
  cumplido, móvil sin scroll horizontal, consola sin errores. Marcar criterio 14 y T6.
