# Especificación — Objetivo semanal de estudio (002-objetivo-semanal)

## Contexto y objetivo
El Diario ya muestra "Esta semana: ⏱️ N minutos" en el hero, pero ese número no dice
nada por sí solo: el estudiante no sabe si es mucho o poco. Esta feature añade un
objetivo semanal: el estudiante fija cuántos minutos quiere estudiar cada semana y ve
de un vistazo cuánto lleva respecto a ese objetivo, para motivarse a cumplirlo. No
añade nuevas formas de registrar sesiones; reutiliza los minutos ya calculados de la
semana en curso. El bloque del objetivo (campo, progreso y botón de quitar) vive
dentro del hero, junto al total semanal ya existente.

## Usuarios
- Estudiante que registra sus sesiones y quiere fijarse una meta semanal para
  motivarse a cumplirla.

## Historias de usuario
- HU-1: como estudiante, quiero fijar cuántos minutos quiero estudiar esta semana,
  para tener una meta concreta.
- HU-2: como estudiante, quiero ver cuánto llevo respecto a mi objetivo (minutos y
  progreso), para saber si voy por buen camino.
- HU-3: como estudiante, quiero cambiar o quitar mi objetivo cuando lo necesite, para
  ajustar la meta a mi ritmo.

## Requisitos funcionales
- RF-1 (fijar objetivo): cuando el estudiante escribe en el hero (junto al total
  semanal) un número entero de minutos mayor o igual a 1 y lo guarda, el Diario debe
  guardar ese valor como objetivo semanal y mostrar el progreso desde ese momento.
- RF-2 (editar objetivo): cuando el estudiante cambia el valor y lo guarda, el Diario
  debe sustituir el objetivo anterior; solo existe un objetivo activo a la vez.
- RF-3 (mostrar progreso): cuando hay un objetivo fijado, el Diario debe mostrar
  "X / Y minutos", siendo X los minutos de la semana en curso (de lunes a hoy, en
  fecha local) e Y el objetivo, junto con una barra de progreso y el porcentaje
  truncado hacia abajo (véase RF-11).
- RF-4 (estado vacío): cuando no hay objetivo fijado, el Diario debe mostrar un
  mensaje que invite a fijarlo y ninguna barra ni porcentaje (no un "0 / 0").
- RF-5 (objetivo inválido): cuando el valor introducido no es un entero mayor o igual
  a 1 (vacío, 0, negativo, decimal o no numérico), el Diario no debe guardarlo, debe
  mostrar un error inline dentro del propio bloque del objetivo (no con `alert`),
  reutilizando el estilo `.error` existente y con `aria-live="polite"`, y mantener el
  objetivo anterior.
- RF-6 (quitar objetivo): cuando el estudiante pulsa el botón explícito
  "Quitar objetivo", el Diario debe eliminar el objetivo guardado y volver al estado
  sin objetivo (el campo vacío no borra la meta por sí solo).
- RF-7 (objetivo cumplido): cuando X es mayor o igual que Y, la barra debe mostrarse
  al 100 % (sin superarlo) y el Diario debe mostrar el texto "¡Objetivo cumplido!"
  junto al progreso.
- RF-8 (definición de semana y fechas): la semana es de lunes a domingo, coherente con
  el total semanal actual; X se calcula de lunes a hoy en fecha local, excluyendo las
  sesiones futuras. Ninguna sesión futura suma en X.
- RF-9 (persistencia y formato del valor): el objetivo se guarda en localStorage bajo
  una clave nueva (`diario-estudio-objetivo`), sin modificar la clave existente
  `diario-estudio-sesiones` (compatibilidad hacia atrás). El valor canónico guardado
  es un número entero positivo de minutos (p. ej. `120`). Cualquier valor que no sea
  un número finito entero mayor o igual a 1 (texto, booleano, objeto, decimal, `NaN`,
  `null`, valor ausente o <= 0) se considera "corrupto o inesperado" y se trata como
  si no hubiera objetivo. El objetivo se conserva entre visitas y entre semanas hasta
  que se cambie o se quite.
- RF-10 (recalcular al momento): el progreso se calcula al mostrar (nunca se guarda) y
  se actualiza al registrar una sesión o al cambiar o quitar el objetivo, sin guardar
  historial.
- RF-11 (cálculo puro y testeable): el cálculo del progreso debe ser una función pura
  `progresoSemanal(sesiones, objetivo, hoy)` que recibe `hoy` como texto "AAAA-MM-DD"
  y no usa `new Date()` sin argumentos, ni DOM, ni localStorage. Deriva el lunes de la
  semana a partir de `hoy` con la técnica de fecha local ya presente en el proyecto
  (`lunesInicioMapa`): partir el texto y construir `new Date(año, mes-1, día)` local.
  Devuelve:
  - `hayObjetivo: false` si `objetivo` no es un entero positivo válido.
  - Si es válido: `hayObjetivo: true`, `minutos` (X, suma de lunes a hoy, futuras
    excluidas), `objetivo` (Y), `porcentaje = Math.min(100, Math.floor((X / Y) * 100))`,
    `ancho` (mismo valor que `porcentaje`, de 0 a 100) y `cumplido = (X >= Y)`.
  La función debe poder probarse con `node --test` pasando un `hoy` fijo. La lógica
  existente impura (`hoyLocal`, `inicioSemanaLocal`, `calcularMinutosSemana`) se queda
  como está para el total del hero; X se calcula con la misma ventana lunes–hoy, por lo
  que coincide con ese total (RNF-4).

## Requisitos no funcionales
- RNF-1: todos los textos visibles están en español.
- RNF-2: el bloque de objetivo se entiende y se usa en una pantalla de móvil (sin
  desplazamiento horizontal).
- RNF-3: el progreso es accesible a lector de pantalla (la barra y el porcentaje
  informan el valor y el objetivo como texto; el error usa `aria-live="polite"`).
- RNF-4: el valor X coincide siempre con el total semanal ya mostrado en el hero
  ("Esta semana"), porque usa la misma ventana lunes–hoy.
- RNF-5: el cálculo del progreso es una función pura y didáctica, probada con
  `node --test`; la derivación del lunes reutiliza la técnica de fecha local existente
  (`lunesInicioMapa`) en lugar de duplicar matemática de fechas de forma inconsistente.

## Casos límite
- Sin objetivo fijado: estado vacío, sin barra ni porcentaje.
- Objetivo activo con X = 0 (semana sin sesiones): se muestra "0 / Y minutos", barra
  al 0 % y sin mensaje de cumplido.
- Objetivo 0, negativo, decimal o no numérico: error inline al guardar y no se guarda.
- Valor guardado corrupto o inesperado (texto, booleano, objeto, decimal, `NaN`,
  `null`, ausente o <= 0): se trata como si no hubiera objetivo, sin romper la página.
- Llevo más del objetivo (X > Y): barra al 100 %, porcentaje al 100 % (truncado con
  tope) y mensaje de cumplido, sin desbordar.
- X < Y que truncado daría 99 % o menos: nunca se muestra "100 %" ni "cumplido" antes
  de alcanzar el objetivo (el redondeo es hacia abajo).
- Objetivo muy grande: no hay cota superior de minutos; la barra queda en un
  porcentaje bajo proporcional a X/Y.
- Semana nueva (hoy es lunes): X solo suma la semana nueva; el objetivo se mantiene.
- Sesiones futuras ya guardadas: no cuentan en X (igual que el total semanal actual).
- Varias sesiones el mismo día: cuentan como su suma (comportamiento ya existente).
- Cambiar el objetivo a mitad de semana: el progreso se recalcula al instante.

## Fuera de alcance
- Objetivos diarios o mensuales (solo semanal).
- Guardar el objetivo o el progreso de cada semana pasada (historial).
- Notificaciones, avisos o recordatorios para cumplir el objetivo.
- Editar o borrar sesiones existentes (no existe hoy en el Diario).
- Comparar el progreso con semanas anteriores.

## Criterios de finalización
- [x] Se puede fijar y editar un objetivo semanal de minutos.
- [x] Con objetivo fijado se ve "X / Y minutos", barra y porcentaje.
- [x] El bloque del objetivo aparece en el hero, junto a "Esta semana".
- [x] Sin objetivo se ve el estado vacío (sin "0 / 0").
- [x] El objetivo inválido se rechaza con error inline en el bloque (sin `alert`).
- [x] El botón "Quitar objetivo" borra la meta y vuelve al estado sin objetivo.
- [x] La barra no supera el 100 % y al cumplir se muestra "¡Objetivo cumplido!".
- [x] El porcentaje se trunca hacia abajo y nunca muestra "100 %" antes de cumplir.
- [x] `progresoSemanal` es pura (recibe "hoy") y se prueba con `node --test`.
- [x] Con objetivo y X = 0 se muestra "0 / Y minutos" y barra al 0 %.
- [x] Un objetivo muy grande se muestra con un porcentaje bajo (sin cota superior).
- [x] X coincide con el total semanal del hero y excluye sesiones futuras.
- [x] El objetivo se conserva al recargar y no toca la clave de sesiones.
- [x] Textos en español, usable en móvil y sin errores en consola (verificado por el usuario en Firefox).

## Dudas abiertas
- (resuelta) El bloque del objetivo y su progreso van dentro del hero, junto al total
  semanal "Esta semana" (no en una sección aparte).
- (resuelta) El progreso muestra "X / Y minutos" + barra de progreso + porcentaje.
- (resuelta) El objetivo se quita con un botón explícito "Quitar objetivo"; dejar el
  campo vacío no borra la meta.
- (ninguna pendiente)
