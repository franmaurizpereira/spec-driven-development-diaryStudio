// Clave para guardar los datos en el navegador
const CLAVE_GUARDADO = "diario-estudio-sesiones";
// Clave para guardar el objetivo semanal de minutos
const CLAVE_OBJETIVO = "diario-estudio-objetivo";

// true en el navegador, false al probar la lógica con node --test
const ES_NAVEGADOR = typeof document !== "undefined";

// Elementos de la página (solo existen en el navegador)
function elemento(id) {
  return ES_NAVEGADOR ? document.getElementById(id) : null;
}

const formulario = elemento("form-sesion");
const campoFecha = elemento("fecha");
const campoTema = elemento("tema");
const campoMinutos = elemento("minutos");
const textoRacha = elemento("racha");
const textoMejorRacha = elemento("mejor-racha");
const textoMinutosSemana = elemento("minutos-semana");
const textoError = elemento("error-formulario");
const lista = elemento("lista-sesiones");
const mensajeVacio = elemento("mensaje-vacio");
const mapaDias = elemento("mapa-dias");
const detalleDiaTexto = elemento("detalle-dia");
const formObjetivo = elemento("form-objetivo");
const campoObjetivo = elemento("objetivo-minutos");
const mensajeObjetivo = elemento("mensaje-objetivo");
const progresoObjetivo = elemento("progreso-objetivo");
const porcentajeObjetivo = elemento("porcentaje-objetivo");
const barraObjetivo = elemento("barra-objetivo");
const barraObjetivoRelleno = elemento("barra-objetivo-relleno");
const errorObjetivo = elemento("error-objetivo");
const botonQuitarObjetivo = elemento("quitar-objetivo");

// Convierte un objeto Date a texto "AAAA-MM-DD" usando la hora local (nunca UTC)
function aTextoFechaLocal(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${año}-${mes}-${dia}`;
}

// Devuelve el texto "AAAA-MM-DD" de hoy en hora local
function hoyLocal() {
  return aTextoFechaLocal(new Date());
}

// Resta N días a un texto "AAAA-MM-DD" y devuelve otro texto "AAAA-MM-DD"
function restarDias(textoFecha, dias) {
  const partes = textoFecha.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  fecha.setDate(fecha.getDate() - dias);
  return aTextoFechaLocal(fecha);
}

// Carga las sesiones guardadas o devuelve una lista vacía
function cargarSesiones() {
  const texto = localStorage.getItem(CLAVE_GUARDADO);
  if (!texto) {
    return [];
  }
  return JSON.parse(texto);
}

// Guarda las sesiones en localStorage
function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(sesiones));
}

// Devuelve el valor si es un objetivo válido (entero mayor o igual a 1), o null
function objetivoValido(valor) {
  if (Number.isInteger(valor) && valor >= 1) {
    return valor;
  }
  return null;
}

// Guarda el objetivo semanal en localStorage como JSON de un entero positivo
function guardarObjetivo(objetivo) {
  localStorage.setItem(CLAVE_OBJETIVO, JSON.stringify(objetivo));
}

// Carga el objetivo semanal guardado, o null si no hay nada o el valor es corrupto
function cargarObjetivo() {
  const texto = localStorage.getItem(CLAVE_OBJETIVO);
  if (!texto) {
    return null;
  }
  try {
    return objetivoValido(JSON.parse(texto));
  } catch (error) {
    // Valor corrupto (JSON roto): se trata como si no hubiera objetivo
    return null;
  }
}

// Quita el objetivo semanal guardado
function quitarObjetivo() {
  localStorage.removeItem(CLAVE_OBJETIVO);
}

// Calcula la racha: días seguidos con sesión que terminan hoy.
// Si hoy aún no tiene sesión pero ayer sí, la racha sigue viva.
function calcularRacha(sesiones) {
  if (sesiones.length === 0) {
    return 0;
  }

  // Días únicos con al menos una sesión
  const diasConEstudio = [...new Set(sesiones.map((s) => s.fecha))];

  const hoy = hoyLocal();
  const ayer = restarDias(hoy, 1);

  // Día desde el que empezamos a contar hacia atrás
  let diaInicio;
  if (diasConEstudio.includes(hoy)) {
    diaInicio = hoy;
  } else if (diasConEstudio.includes(ayer)) {
    diaInicio = ayer;
  } else {
    return 0;
  }

  // Contamos hacia atrás mientras haya días consecutivos
  let racha = 0;
  let diaActual = diaInicio;
  while (diasConEstudio.includes(diaActual)) {
    racha = racha + 1;
    diaActual = restarDias(diaActual, 1);
  }
  return racha;
}

// Calcula la mejor racha: el máximo de días seguidos con sesión.
// Las fechas futuras no cuentan.
function calcularMejorRacha(sesiones) {
  if (sesiones.length === 0) {
    return 0;
  }

  const hoy = hoyLocal();

  // Días únicos pasados o de hoy, ordenados de más antiguo a más reciente
  const dias = [...new Set(sesiones.map((s) => s.fecha))]
    .filter((fecha) => fecha <= hoy)
    .sort();

  let mejor = 1;
  let actual = 1;
  for (let i = 1; i < dias.length; i++) {
    // Son seguidos si al restar 1 día al actual volvemos al anterior
    if (restarDias(dias[i], 1) === dias[i - 1]) {
      actual = actual + 1;
    } else {
      actual = 1;
    }
    if (actual > mejor) {
      mejor = actual;
    }
  }
  return mejor;
}

// Devuelve el lunes de la semana actual como texto "AAAA-MM-DD" (semana de lunes a domingo)
function inicioSemanaLocal() {
  const hoy = hoyLocal();
  const partes = hoy.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  // getDay: 0 = domingo, 1 = lunes, ... 6 = sábado
  const diasDesdeLunes = (fecha.getDay() + 6) % 7;
  return restarDias(hoy, diasDesdeLunes);
}

// Suma los minutos de las sesiones desde el lunes hasta hoy (futuras excluidas)
function calcularMinutosSemana(sesiones) {
  const hoy = hoyLocal();
  const lunes = inicioSemanaLocal();
  let total = 0;
  for (const s of sesiones) {
    if (typeof s.fecha === "string" && s.fecha >= lunes && s.fecha <= hoy) {
      total = total + Number(s.minutos);
    }
  }
  return total;
}

// Suma los minutos por día: { "AAAA-MM-DD": total }
function totalesPorDia(sesiones) {
  const totales = {};
  for (const s of sesiones) {
    if (typeof s.fecha !== "string") {
      continue;
    }
    totales[s.fecha] = (totales[s.fecha] || 0) + Number(s.minutos);
  }
  return totales;
}

// Lunes desde el que empieza el mapa: 7 semanas antes del lunes actual
function lunesInicioMapa(hoyTexto) {
  const partes = hoyTexto.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  const diasDesdeLunes = (fecha.getDay() + 6) % 7;
  const lunesActual = restarDias(hoyTexto, diasDesdeLunes);
  return restarDias(lunesActual, 7 * 7);
}

// Devuelve el lunes de la semana de hoyTexto como "AAAA-MM-DD" (semana de lunes a domingo)
function lunesDeSemana(hoyTexto) {
  const partes = hoyTexto.split("-");
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  // getDay: 0 = domingo, 1 = lunes, ... 6 = sábado
  const diasDesdeLunes = (fecha.getDay() + 6) % 7;
  return restarDias(hoyTexto, diasDesdeLunes);
}

// Calcula el progreso semanal respecto al objetivo.
// Devuelve { hayObjetivo: false } si el objetivo no es un entero mayor o igual a 1.
function progresoSemanal(sesiones, objetivo, hoy) {
  if (!Number.isInteger(objetivo) || objetivo < 1) {
    return { hayObjetivo: false };
  }

  const lunes = lunesDeSemana(hoy);
  let minutos = 0;
  for (const s of sesiones) {
    if (typeof s.fecha === "string" && s.fecha >= lunes && s.fecha <= hoy) {
      minutos = minutos + Number(s.minutos);
    }
  }

  // Truncado hacia abajo y con tope en 100, sin redondear hacia arriba
  const porcentaje = Math.min(100, Math.floor((minutos / objetivo) * 100));
  return {
    hayObjetivo: true,
    minutos: minutos,
    objetivo: objetivo,
    porcentaje: porcentaje,
    ancho: porcentaje,
    cumplido: minutos >= objetivo,
  };
}

// Lista de 56 días "AAAA-MM-DD": 8 semanas de lunes a domingo (incluye futuros)
function diasVentanaMapa(hoyTexto) {
  const dias = [];
  let dia = lunesInicioMapa(hoyTexto);
  for (let i = 0; i < 8 * 7; i++) {
    dias.push(dia);
    dia = restarDias(dia, -1);
  }
  return dias;
}

// Nivel de color 0-4 relativo al máximo del periodo (futuros excluidos del máximo)
function nivelIntensidad(totalDia, maximo) {
  if (maximo <= 0 || totalDia <= 0) {
    return 0;
  }
  return Math.min(4, Math.ceil((totalDia / maximo) * 4));
}

// Datos del mapa: [{ fecha, total, futura, nivel }]
function datosMapaCalor(sesiones, hoyTexto) {
  const totales = totalesPorDia(sesiones);
  const dias = diasVentanaMapa(hoyTexto);
  let maximo = 0;
  for (const dia of dias) {
    if (dia <= hoyTexto && (totales[dia] || 0) > maximo) {
      maximo = totales[dia];
    }
  }
  return dias.map((dia) => {
    const futura = dia > hoyTexto;
    const total = futura ? 0 : totales[dia] || 0;
    return { fecha: dia, total: total, futura: futura, nivel: futura ? 0 : nivelIntensidad(total, maximo) };
  });
}

// Texto del detalle de un día: fecha, minutos y temas (null si es futuro)
function detalleDia(sesiones, fechaTexto, hoyTexto) {
  if (fechaTexto > hoyTexto) {
    return null;
  }
  const delDia = sesiones.filter((s) => s.fecha === fechaTexto);
  if (delDia.length === 0) {
    return `${fechaTexto}: sin sesiones`;
  }
  let total = 0;
  for (const s of delDia) {
    total = total + Number(s.minutos);
  }
  const temas = [...new Set(delDia.map((s) => s.tema))].join(", ");
  return `${fechaTexto}: ${total} min — ${temas}`;
}

// Muestra un mensaje de error dentro del formulario
function mostrarError(mensaje) {
  textoError.textContent = mensaje;
  textoError.hidden = false;
}

// Oculta el mensaje de error del formulario
function limpiarError() {
  textoError.textContent = "";
  textoError.hidden = true;
}

// Muestra un error inline dentro del formulario del objetivo (sin alert)
function mostrarErrorObjetivo(mensaje) {
  errorObjetivo.textContent = mensaje;
  errorObjetivo.hidden = false;
}

// Oculta el error del formulario del objetivo
function limpiarErrorObjetivo() {
  errorObjetivo.textContent = "";
  errorObjetivo.hidden = true;
}

// Pinta el bloque del objetivo semanal: estado vacío o "X / Y minutos" con barra
function pintarObjetivo(sesiones, hoy) {
  const progreso = progresoSemanal(sesiones, cargarObjetivo(), hoy);

  if (!progreso.hayObjetivo) {
    // Sin objetivo: invitamos a fijarlo y no mostramos barra ni porcentaje
    mensajeObjetivo.hidden = false;
    progresoObjetivo.hidden = true;
    porcentajeObjetivo.hidden = true;
    barraObjetivo.hidden = true;
    botonQuitarObjetivo.hidden = true;
    return;
  }

  mensajeObjetivo.hidden = true;
  progresoObjetivo.hidden = false;
  porcentajeObjetivo.hidden = false;
  barraObjetivo.hidden = false;
  botonQuitarObjetivo.hidden = false;

  progresoObjetivo.textContent = `${progreso.minutos} / ${progreso.objetivo} minutos`;

  // Pre-rellenamos el campo con el objetivo guardado para facilitar editarlo
  campoObjetivo.value = String(progreso.objetivo);

  // Porcentaje truncado; al cumplir añadimos el mensaje de celebración
  let textoPorcentaje = `${progreso.porcentaje} %`;
  if (progreso.cumplido) {
    textoPorcentaje = `${progreso.porcentaje} % · ¡Objetivo cumplido!`;
  }
  porcentajeObjetivo.textContent = textoPorcentaje;

  barraObjetivoRelleno.style.width = `${progreso.ancho}%`;
}

// Muestra la racha y la lista en la página
function mostrarDatos() {
  const hoy = hoyLocal();
  // Solo mostramos sesiones de hoy o del pasado; las futuras aparecen al llegar su día.
  // Las entradas sin fecha válida también se ocultan en vez de pintarse rotas.
  const sesiones = cargarSesiones().filter(
    (s) => typeof s.fecha === "string" && s.fecha <= hoy
  );

  // Ordenar de la más reciente a la más antigua
  sesiones.sort((a, b) => {
    if (a.fecha < b.fecha) return 1;
    if (a.fecha > b.fecha) return -1;
    return b.id - a.id;
  });

  // Racha
  textoRacha.textContent = calcularRacha(sesiones);
  textoMejorRacha.textContent = calcularMejorRacha(sesiones);
  textoMinutosSemana.textContent = calcularMinutosSemana(sesiones);

  // Objetivo semanal (mismo array de sesiones que "Esta semana", así X coincide)
  pintarObjetivo(sesiones, hoy);

  // Lista
  lista.innerHTML = "";
  if (sesiones.length === 0) {
    mensajeVacio.style.display = "block";
  } else {
    mensajeVacio.style.display = "none";
  }

  for (const sesion of sesiones) {
    const item = document.createElement("li");
    item.textContent = `${sesion.fecha} — ${sesion.tema} (${sesion.minutos} min)`;
    lista.appendChild(item);
  }

  // Mapa de calor: usa todas las sesiones (las futuras se atenúan, no se colorean)
  const todas = cargarSesiones();
  const datosMapa = datosMapaCalor(todas, hoy);
  mapaDias.innerHTML = "";
  for (const dia of datosMapa) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "dia nivel-" + dia.nivel + (dia.futura ? " futura" : "");
    boton.dataset.fecha = dia.fecha;
    if (dia.futura) {
      boton.disabled = true;
      boton.setAttribute("aria-label", dia.fecha + ": día futuro");
    } else if (dia.total > 0) {
      boton.setAttribute("aria-label", dia.fecha + ": " + dia.total + " minutos");
    } else {
      boton.setAttribute("aria-label", dia.fecha + ": sin sesiones");
    }
    boton.addEventListener("click", function () {
      detalleDiaTexto.textContent = detalleDia(todas, dia.fecha, hoy);
    });
    mapaDias.appendChild(boton);
  }
  detalleDiaTexto.textContent = "Pulsa un día para ver el detalle.";
}

// Cuando se envía el formulario, guardamos la sesión (?. no falla sin navegador)
formulario?.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Validaciones simples
  if (!fecha) {
    alert("Elige una fecha.");
    return;
  }
  if (fecha > hoyLocal()) {
    mostrarError("La fecha no puede ser posterior a hoy.");
    return;
  }
  if (tema === "") {
    alert("Escribe un tema.");
    return;
  }
  if (!Number.isFinite(minutos) || minutos <= 0) {
    alert("Los minutos tienen que ser un número mayor que 0.");
    return;
  }

  const sesiones = cargarSesiones();
  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos,
  });
  guardarSesiones(sesiones);

  // Limpiamos tema y minutos, dejamos la fecha en hoy
  campoFecha.value = hoyLocal();
  campoFecha.max = hoyLocal();
  campoTema.value = "";
  campoMinutos.value = "";
  limpiarError();

  mostrarDatos();
});

// Si el usuario cambia la fecha, ocultamos el error anterior
campoFecha?.addEventListener("input", limpiarError);

// Al enviar el formulario del objetivo: validamos y guardamos la meta semanal
formObjetivo?.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const valor = Number(campoObjetivo.value);

  // El objetivo debe ser un número entero mayor o igual a 1
  if (!objetivoValido(valor)) {
    mostrarErrorObjetivo("El objetivo debe ser un número entero mayor o igual a 1.");
    return;
  }

  guardarObjetivo(valor);
  limpiarErrorObjetivo();
  campoObjetivo.value = "";
  mostrarDatos();
});

// Al teclear en el campo del objetivo, ocultamos el error anterior
campoObjetivo?.addEventListener("input", limpiarErrorObjetivo);

// Botón "Quitar objetivo": borramos la meta y repintamos
botonQuitarObjetivo?.addEventListener("click", function () {
  quitarObjetivo();
  campoObjetivo.value = "";
  limpiarErrorObjetivo();
  mostrarDatos();
});

// Al abrir la página: fecha por defecto = hoy, y mostramos lo guardado
if (ES_NAVEGADOR) {
  campoFecha.value = hoyLocal();
  campoFecha.max = hoyLocal();
  mostrarDatos();
}

// Exporta la lógica pura para probarla con node --test (sin navegador)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    aTextoFechaLocal,
    hoyLocal,
    restarDias,
    calcularRacha,
    calcularMejorRacha,
    calcularMinutosSemana,
    totalesPorDia,
    lunesInicioMapa,
    diasVentanaMapa,
    nivelIntensidad,
    datosMapaCalor,
    detalleDia,
    lunesDeSemana,
    progresoSemanal,
    objetivoValido,
  };
}
