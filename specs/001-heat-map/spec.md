# Especificación — Mapa de calor de estudio (001-heat-map)

## Contexto y objetivo
El Diario muestra racha, mejor racha y minutos semanales como números, pero no deja
ver de un vistazo la constancia de las últimas semanas. El mapa de calor tipo GitHub
cubre ese hueco: 8 semanas de días coloreados según los minutos estudiados, para
motivar la racha diaria sin añadir formas de registrar o editar.

## Usuarios
- Estudiante que registra sus sesiones y quiere comprobar su constancia visualmente.

## Historias de usuario
- HU-1: como estudiante, quiero ver los días estudiados de las últimas 8 semanas con
intensidad según minutos, para saber si mantengo el ritmo.
- HU-2: como estudiante, quiero pulsar un día con estudio y ver su fecha, minutos y
temas, para recordar qué hice ese día.

## Requisitos funcionales
- RF-1 (ventana): cuando el estudiante abre el Diario, el mapa debe mostrar la semana
actual más las 7 anteriores, en semanas de lunes a domingo.
- RF-2 (agregación): cuando un día tiene varias sesiones, el mapa debe sumar sus
minutos como total del día.
- RF-3 (intensidad relativa): cuando el periodo tiene al menos un minuto, el día con
el mayor total debe mostrarse con la intensidad máxima, los días sin estudio con el
color vacío y el resto con una intensidad proporcional a su total.
- RF-4 (periodo vacío): si no hay ninguna sesión en las 8 semanas, todos los días
deben mostrarse con el color vacío.
- RF-5 (futuros): los días posteriores a hoy deben mostrarse atenuados, sin color de
estudio aunque tengan sesiones guardadas, y no deben ser seleccionables.
- RF-6 (detalle): cuando el estudiante pulsa un día con estudio, el mapa debe mostrar
su fecha, el total de minutos y los temas de ese día.
- RF-8 (detalle vacío): cuando el estudiante pulsa un día pasado sin sesión, el mapa
debe mostrar su fecha con el texto "sin sesiones".
- RF-7 (fechas): todas las comparaciones de días deben usar la fecha local del
usuario; las sesiones futuras nunca cuentan en totales ni intensidades.

## Requisitos no funcionales
- RNF-1: todos los textos visibles del mapa y del detalle están en español.
- RNF-2: el mapa se entiende y se usa en una pantalla de móvil (sin desplazamiento
horizontal).
- RNF-3: cada día informa su fecha y minutos de forma accesible a lector de pantalla.
- RNF-4: el mapa refleja lo mismo que la lista y los totales ante los mismos datos.

## Casos límite
- Semana actual empezada (p. ej. hoy es lunes): los días futuros se atenúan.
- Empate en el máximo: todos los días empatados usan la intensidad máxima.
- Sesiones futuras ya guardadas: ocultas del mapa hasta que llegue su día.
- Varias sesiones el mismo día cuentan como un solo día coloreado con la suma.

## Fuera de alcance
- Navegar a periodos anteriores o cambiar el tamaño de la ventana de 8 semanas.
- Editar o borrar sesiones desde el mapa o desde el detalle.
- Leyenda con umbrales fijos de minutos (la escala es relativa).
- Avisos o notificaciones para recuperar la racha.

## Criterios de finalización
- [x] Se ven 8 semanas de lunes a domingo con la semana actual la última.
- [x] El día de mayor total tiene la intensidad máxima y los vacíos el color vacío.
- [x] Los días futuros se distinguen y no se pueden pulsar.
- [x] Pulsar un día muestra fecha, minutos y temas; el periodo vacío muestra todo vacío.
- [x] Textos en español, usable en móvil y sin errores en consola.

## Dudas abiertas
- (resuelta) Al pulsar un día pasado sin sesión se muestra su fecha con "sin sesiones".
