// Tests de la lógica pura del objetivo semanal (node --test, sin dependencias)
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { lunesDeSemana, progresoSemanal, objetivoValido } = require("../app.js");

const HOY = "2026-10-02"; // viernes; su lunes es "2026-09-28"

describe("lunesDeSemana (RF-8 y RF-11)", () => {
  it("un lunes se queda igual", () => {
    assert.equal(lunesDeSemana("2026-09-28"), "2026-09-28");
  });

  it("un miércoles vuelve al lunes de su semana", () => {
    assert.equal(lunesDeSemana("2026-09-30"), "2026-09-28");
  });

  it("un domingo vuelve al lunes de su semana", () => {
    assert.equal(lunesDeSemana("2026-10-04"), "2026-09-28");
  });

  it("cambia de mes sin usar UTC", () => {
    assert.equal(lunesDeSemana("2026-10-01"), "2026-09-28");
  });

  it("cambia de año sin usar UTC", () => {
    assert.equal(lunesDeSemana("2026-01-01"), "2025-12-29");
  });
});

describe("progresoSemanal: objetivo inválido (RF-4 y RF-9)", () => {
  const invalidos = [0, -5, 1.5, "abc", null, NaN, undefined];
  for (const objetivo of invalidos) {
    it(`objetivo ${String(objetivo)} devuelve { hayObjetivo: false }`, () => {
      assert.deepEqual(progresoSemanal([], objetivo, HOY), { hayObjetivo: false });
    });
  }

  it("objetivo ausente devuelve { hayObjetivo: false }", () => {
    assert.deepEqual(progresoSemanal([], undefined, HOY), { hayObjetivo: false });
  });

  it("una cadena numérica se trata como corrupta", () => {
    assert.deepEqual(progresoSemanal([], "120", HOY), { hayObjetivo: false });
  });
});

describe("progresoSemanal: ventana y suma (RF-8)", () => {
  it("suma las sesiones de lunes a hoy y excluye futuras y días previos al lunes", () => {
    const sesiones = [
      { id: 1, fecha: "2026-09-27", tema: "mates", minutos: 100 }, // domingo anterior
      { id: 2, fecha: "2026-09-28", tema: "mates", minutos: 30 }, // lunes
      { id: 3, fecha: "2026-09-29", tema: "lengua", minutos: 20 }, // martes
      { id: 4, fecha: "2026-10-02", tema: "historia", minutos: 10 }, // hoy
      { id: 5, fecha: "2026-10-03", tema: "física", minutos: 999 }, // futura
    ];
    const progreso = progresoSemanal(sesiones, 120, HOY);
    assert.equal(progreso.hayObjetivo, true);
    assert.equal(progreso.minutos, 60);
    assert.equal(progreso.objetivo, 120);
  });

  it("ignora sesiones sin fecha string válida", () => {
    const sesiones = [
      { id: 1, fecha: "2026-09-28", tema: "mates", minutos: 30 },
      { id: 2, tema: "lengua", minutos: 40 }, // sin fecha
    ];
    assert.equal(progresoSemanal(sesiones, 120, HOY).minutos, 30);
  });
});

describe("progresoSemanal: porcentaje y cumplido (RF-3 y RF-7)", () => {
  it("con X = 0 la barra queda al 0 % y sin cumplir", () => {
    const progreso = progresoSemanal([], 120, HOY);
    assert.equal(progreso.hayObjetivo, true);
    assert.equal(progreso.minutos, 0);
    assert.equal(progreso.porcentaje, 0);
    assert.equal(progreso.ancho, 0);
    assert.equal(progreso.cumplido, false);
  });

  it("con X < Y trunca hacia abajo y no marca cumplido", () => {
    const sesiones = [{ id: 1, fecha: "2026-09-28", tema: "mates", minutos: 50 }];
    const progreso = progresoSemanal(sesiones, 120, HOY);
    assert.equal(progreso.porcentaje, 41);
    assert.equal(progreso.ancho, 41);
    assert.equal(progreso.cumplido, false);
  });

  it("119 / 120 trunca a 99, nunca 100 antes de cumplir", () => {
    const sesiones = [{ id: 1, fecha: "2026-09-28", tema: "mates", minutos: 119 }];
    const progreso = progresoSemanal(sesiones, 120, HOY);
    assert.equal(progreso.porcentaje, 99);
    assert.equal(progreso.cumplido, false);
  });

  it("con X = Y marca 100 % y cumplido", () => {
    const sesiones = [{ id: 1, fecha: "2026-09-28", tema: "mates", minutos: 120 }];
    const progreso = progresoSemanal(sesiones, 120, HOY);
    assert.equal(progreso.porcentaje, 100);
    assert.equal(progreso.ancho, 100);
    assert.equal(progreso.cumplido, true);
  });

  it("con X > Y toca el 100 % sin desbordar y marca cumplido", () => {
    const sesiones = [{ id: 1, fecha: "2026-09-28", tema: "mates", minutos: 150 }];
    const progreso = progresoSemanal(sesiones, 120, HOY);
    assert.equal(progreso.porcentaje, 100);
    assert.equal(progreso.ancho, 100);
    assert.equal(progreso.cumplido, true);
  });

  it("un objetivo muy grande da un porcentaje bajo sin cota superior", () => {
    const sesiones = [{ id: 1, fecha: "2026-09-28", tema: "mates", minutos: 10 }];
    const progreso = progresoSemanal(sesiones, 100000, HOY);
    assert.equal(progreso.porcentaje, 0);
    assert.equal(progreso.cumplido, false);
  });
});

describe("objetivoValido (RF-9, validación de la persistencia)", () => {
  it("devuelve el entero positivo tal cual", () => {
    assert.equal(objetivoValido(120), 120);
    assert.equal(objetivoValido(1), 1);
  });

  it("devuelve null para 0, negativos y decimales", () => {
    assert.equal(objetivoValido(0), null);
    assert.equal(objetivoValido(-5), null);
    assert.equal(objetivoValido(1.5), null);
  });

  it("devuelve null para textos, booleanos, objetos, NaN, null y undefined", () => {
    assert.equal(objetivoValido("120"), null);
    assert.equal(objetivoValido("abc"), null);
    assert.equal(objetivoValido(true), null);
    assert.equal(objetivoValido({}), null);
    assert.equal(objetivoValido(NaN), null);
    assert.equal(objetivoValido(null), null);
    assert.equal(objetivoValido(undefined), null);
  });
});
