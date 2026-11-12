import { describe, expect, it } from "vitest";
import {
  calcularProgresoSemana,
  calcularRachas,
  evaluarHitos,
  fechaADiaEcuador,
  perteneceASemanaEcuador,
} from "./progreso";

describe("Dominio - Progreso, Metas, Rachas e Hitos", () => {
  describe("1. Corte semanal lunes a domingo en America/Guayaquil (UTC-5)", () => {
    it("distingue correctamente domingo 23:30 (semana A) de lunes 00:10 (semana B)", () => {
      // Domingo 10 de Noviembre de 2024, 23:30 en Ecuador = 2024-11-11T04:30:00Z
      const domingoNocheIso = "2024-11-11T04:30:00.000Z";
      // Lunes 11 de Noviembre de 2024, 00:10 en Ecuador = 2024-11-11T05:10:00Z
      const lunesMadrugadaIso = "2024-11-11T05:10:00.000Z";

      expect(fechaADiaEcuador(domingoNocheIso)).toBe("2024-11-10");
      expect(fechaADiaEcuador(lunesMadrugadaIso)).toBe("2024-11-11");

      // Si la semana de referencia es la del domingo 10 de nov
      const refDomingo = "2024-11-10T15:00:00-05:00";
      expect(perteneceASemanaEcuador(domingoNocheIso, refDomingo)).toBe(true);
      expect(perteneceASemanaEcuador(lunesMadrugadaIso, refDomingo)).toBe(false);

      // Si la semana de referencia es la del lunes 11 de nov
      const refLunes = "2024-11-11T12:00:00-05:00";
      expect(perteneceASemanaEcuador(domingoNocheIso, refLunes)).toBe(false);
      expect(perteneceASemanaEcuador(lunesMadrugadaIso, refLunes)).toBe(true);
    });
  });

  describe("2. Múltiples partidas en el mismo día", () => {
    it("computan como 1 único día jugado pero acumulan la totalidad de horas", () => {
      const refSemana = "2024-11-13T12:00:00-05:00"; // Miércoles 13 de nov

      // 3 partidas en el mismo día (Martes 12 de nov, hora Ecuador)
      const partidas = [
        { fecha: "2024-11-12T10:00:00-05:00", duracionMinutos: 45 },
        { fecha: "2024-11-12T15:30:00-05:00", duracionMinutos: 60 },
        { fecha: "2024-11-12T20:00:00-05:00", duracionMinutos: 75 },
      ];

      const progreso = calcularProgresoSemana(partidas, 5, refSemana);

      // 45 + 60 + 75 = 180 min = 3.0 horas
      expect(progreso.diasJugados).toBe(1);
      expect(progreso.horasJugadas).toBe(3.0);
      expect(progreso.porcentajeReal).toBe(60);
      expect(progreso.porcentajeVisual).toBe(60);
    });
  });

  describe("3. Partidas que cruzan la medianoche", () => {
    it("computan en el día de inicio según el huso horario America/Guayaquil", () => {
      // Partida iniciada viernes 15 de nov a las 23:30 (UTC-5) que finaliza sábado a la 01:00
      // Su fecha de inicio registrada es 23:30 del viernes
      const inicioViernesNoche = "2024-11-15T23:30:00-05:00";
      expect(fechaADiaEcuador(inicioViernesNoche)).toBe("2024-11-15");

      const partidas = [{ fecha: inicioViernesNoche, duracionMinutos: 90 }];
      const progreso = calcularProgresoSemana(partidas, 4, "2024-11-15T12:00:00-05:00");

      expect(progreso.diasJugados).toBe(1);
      expect(progreso.horasJugadas).toBe(1.5);
    });
  });

  describe("4. Racha activa y racha rota", () => {
    it("mantiene la racha activa si ayer se jugó aunque hoy aún no", () => {
      // Hoy es 15 de Noviembre
      const hoyRef = "2024-11-15T10:00:00-05:00";

      // Jugó el 13 y el 14 (ayer), pero no el 15 (hoy)
      const fechas = ["2024-11-13T18:00:00-05:00", "2024-11-14T21:00:00-05:00"];

      const resultado = calcularRachas(fechas, hoyRef);
      expect(resultado.rachaActual).toBe(2);
    });

    it("incrementa la racha si también se registra partida hoy", () => {
      const hoyRef = "2024-11-15T10:00:00-05:00";

      // Jugó 13, 14 y 15 (hoy)
      const fechas = [
        "2024-11-13T18:00:00-05:00",
        "2024-11-14T21:00:00-05:00",
        "2024-11-15T09:00:00-05:00",
      ];

      const resultado = calcularRachas(fechas, hoyRef);
      expect(resultado.rachaActual).toBe(3);
    });

    it("se rompe (0 días) si no hay partida registrada ni hoy ni ayer", () => {
      const hoyRef = "2024-11-15T10:00:00-05:00";

      // Jugó el 10, 11 y 12. No jugó el 13, ni el 14 (ayer), ni el 15 (hoy)
      const fechas = [
        "2024-11-10T18:00:00-05:00",
        "2024-11-11T18:00:00-05:00",
        "2024-11-12T18:00:00-05:00",
      ];

      const resultado = calcularRachas(fechas, hoyRef);
      expect(resultado.rachaActual).toBe(0);
      expect(resultado.mejorRacha).toBe(3);
    });
  });

  describe("5. Cálculo de mejor racha histórica", () => {
    it("determina el récord histórico más extenso a lo largo de todo el calendario", () => {
      const hoyRef = "2024-11-20T12:00:00-05:00";

      // Racha pasada de 5 días (del 01 al 05 de nov)
      // Pausa del 06 al 17
      // Racha actual de 2 días (19 y 20 de nov)
      const fechas = [
        "2024-11-01T15:00:00-05:00",
        "2024-11-02T15:00:00-05:00",
        "2024-11-03T15:00:00-05:00",
        "2024-11-04T15:00:00-05:00",
        "2024-11-05T15:00:00-05:00",
        "2024-11-19T20:00:00-05:00",
        "2024-11-20T10:00:00-05:00",
      ];

      const resultado = calcularRachas(fechas, hoyRef);
      expect(resultado.rachaActual).toBe(2);
      expect(resultado.mejorRacha).toBe(5);
    });
  });

  describe("6. Tope de porcentaje visual al 100 % y redondeo", () => {
    it("limita el porcentaje visual a 100 % pero conserva las horas reales acumuladas", () => {
      const refSemana = "2024-11-13T12:00:00-05:00";
      // Meta semanal de 4 horas; usuario juega 6.5 horas (390 minutos)
      const partidas = [{ fecha: "2024-11-13T15:00:00-05:00", duracionMinutos: 390 }];

      const progreso = calcularProgresoSemana(partidas, 4, refSemana);

      expect(progreso.horasJugadas).toBe(6.5);
      expect(progreso.metaHoras).toBe(4);
      expect(progreso.porcentajeReal).toBe(163); // 6.5 / 4 = 162.5% -> 163%
      expect(progreso.porcentajeVisual).toBe(100);
    });

    it("redondea horas a un decimal correctamente", () => {
      const refSemana = "2024-11-13T12:00:00-05:00";
      // 70 minutos = 1.1666... horas -> redondeado a 1.2
      const partidas = [{ fecha: "2024-11-13T15:00:00-05:00", duracionMinutos: 70 }];

      const progreso = calcularProgresoSemana(partidas, 5, refSemana);
      expect(progreso.horasJugadas).toBe(1.2);
    });
  });

  describe("7. Hitos alcanzados y revocación dinámica", () => {
    const hitosConfigurados = [
      { nombre: "Iniciación", horasObjetivo: 5 },
      { nombre: "Dedicación", horasObjetivo: 15 },
      { nombre: "Maestría", horasObjetivo: 30 },
    ];

    it("desbloquea hitos alcanzados según las horas acumuladas", () => {
      const evaluados = evaluarHitos(hitosConfigurados, 16.5);

      expect(evaluados).toEqual([
        { nombre: "Iniciación", horasObjetivo: 5, alcanzado: true },
        { nombre: "Dedicación", horasObjetivo: 15, alcanzado: true },
        { nombre: "Maestría", horasObjetivo: 30, alcanzado: false },
      ]);
    });

    it("revoca dinámicamente un hito si las horas bajan (ej. por eliminación de partidas)", () => {
      // Supongamos que se eliminó una partida de 3 horas, bajando de 16.5 a 13.5 horas
      const evaluados = evaluarHitos(hitosConfigurados, 13.5);

      expect(evaluados).toEqual([
        { nombre: "Iniciación", horasObjetivo: 5, alcanzado: true },
        { nombre: "Dedicación", horasObjetivo: 15, alcanzado: false }, // Vuelve a pendiente
        { nombre: "Maestría", horasObjetivo: 30, alcanzado: false },
      ]);
    });
  });

  describe("8. Escenario sin partidas", () => {
    it("devuelve valores en 0 y rachas en 0 cuando no hay registros", () => {
      const progreso = calcularProgresoSemana([], 5, "2024-11-15T10:00:00-05:00");
      expect(progreso).toEqual({
        horasJugadas: 0,
        metaHoras: 5,
        diasJugados: 0,
        porcentajeReal: 0,
        porcentajeVisual: 0,
      });

      const rachas = calcularRachas([], "2024-11-15T10:00:00-05:00");
      expect(rachas).toEqual({
        rachaActual: 0,
        mejorRacha: 0,
      });

      const hitos = evaluarHitos([{ nombre: "Prueba", horasObjetivo: 10 }], 0);
      expect(hitos).toEqual([{ nombre: "Prueba", horasObjetivo: 10, alcanzado: false }]);
    });
  });
});
