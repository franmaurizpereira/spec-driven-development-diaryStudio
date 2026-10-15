// Tests de la lógica pura del mapa de calor (node --test, sin dependencias)
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  restarDias,
  totalesPorDia,
  diasVentanaMapa,
  nivelIntensidad,
  datosMapaCalor,
  detalleDia,
} = require("../app.js");

const HOY = "2026-10-02"; // viernes, fecha fija para que los tests no cambien

function diaSemanaLocal(textoFecha) {
  const partes = textoFecha.split("-");
  return new Date(partes[0], partes[1] - 1, partes[2]).getDay();
}

describe("ventana del mapa (RF-1)", () => {
  it("son 56 días que empiezan en lunes y terminan en domingo", () => {
    const dias = diasVentanaMapa(HOY);
    assert.equal(dias.length, 56);
    assert.equal(dias[0], "2026-08-10");
    assert.equal(dias[55], "2026-10-04");
    assert.equal(diaSemanaLocal(dias[0]), 1);
    assert.equal(diaSemanaLocal(dias[55]), 0);
    assert.ok(dias.includes(HOY));
  });
});

describe("agregación por día (RF-2)", () => {
  it("varias sesiones del mismo día suman sus minutos", () => {
    const totales = totalesPorDia([
      { fecha: "2026-09-30", tema: "mates", minutos: 20 },
      { fecha: "2026-09-30", tema: "lengua", minutos: 40 },
    ]);
    assert.equal(totales["2026-09-30"], 60);
  });
});

describe("intensidad relativa (RF-3 y RF-4)", () => {
  it("el máximo es nivel 4, la mitad es nivel 2 y el cero es nivel 0", () => {
    assert.equal(nivelIntensidad(120, 120), 4);
    assert.equal(nivelIntensidad(60, 120), 2);
    assert.equal(nivelIntensidad(0, 120), 0);
  });

  it("sin sesiones en el periodo todo es nivel 0", () => {
    const datos = datosMapaCalor([], HOY);
    assert.ok(datos.every((d) => d.nivel === 0));
  });
});

describe("días futuros (RF-5 y RF-7)", () => {
  it("no cuentan para el máximo y salen atenuados sin nivel", () => {
    const datos = datosMapaCalor(
      [{ fecha: "2026-10-03", tema: "mates", minutos: 999 }],
      HOY
    );
    const futuro = datos.find((d) => d.fecha === "2026-10-03");
    assert.equal(futuro.futura, true);
    assert.equal(futuro.total, 0);
    assert.equal(futuro.nivel, 0);
    assert.ok(datos.every((d) => d.nivel === 0));
  });
});

describe("detalle del día (RF-6 y RF-8)", () => {
  it("muestra fecha, minutos y temas", () => {
    const texto = detalleDia(
      [
        { fecha: "2026-09-30", tema: "mates", minutos: 20 },
        { fecha: "2026-09-30", tema: "lengua", minutos: 40 },
      ],
      "2026-09-30",
      HOY
    );
    assert.equal(texto, "2026-09-30: 60 min — mates, lengua");
  });

  it("un día pasado sin sesiones dice 'sin sesiones'", () => {
    assert.equal(detalleDia([], "2026-09-29", HOY), "2026-09-29: sin sesiones");
  });

  it("un día futuro devuelve null", () => {
    assert.equal(detalleDia([], "2026-10-03", HOY), null);
  });
});

describe("fechas en hora local (RF-7)", () => {
  it("restar días cruza de mes sin usar UTC", () => {
    assert.equal(restarDias("2026-10-01", 1), "2026-09-30");
  });
});
