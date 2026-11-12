export interface PartidaSimple {
  fecha: Date | string;
  duracionMinutos: number;
}

export interface HitoSimple {
  nombre: string;
  horasObjetivo: number;
}

export interface HitoEvaluado extends HitoSimple {
  alcanzado: boolean;
}

export interface ProgresoSemanaResultado {
  horasJugadas: number;
  metaHoras: number;
  diasJugados: number;
  porcentajeReal: number;
  porcentajeVisual: number;
}

export interface RachasResultado {
  rachaActual: number;
  mejorRacha: number;
}

const ZONA_HORARIA = "America/Guayaquil";

/**
 * Convierte una fecha a string 'YYYY-MM-DD' en el huso horario oficial de Ecuador (America/Guayaquil, UTC-5).
 */
export function fechaADiaEcuador(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Calcula la diferencia en días enteros entre dos fechas 'YYYY-MM-DD'.
 */
function diferenciaDias(diaA: string, diaB: string): number {
  const [yA, mA, dA] = diaA.split("-").map(Number);
  const [yB, mB, dB] = diaB.split("-").map(Number);
  const utcA = Date.UTC(yA, mA - 1, dA);
  const utcB = Date.UTC(yB, mB - 1, dB);
  return Math.round((utcA - utcB) / (24 * 60 * 60 * 1000));
}

/**
 * Obtiene el día de la semana (1 = lunes, ..., 7 = domingo) para una fecha 'YYYY-MM-DD'.
 */
function obtenerDiaDeSemanaIso(dia: string): number {
  const [y, m, d] = dia.split("-").map(Number);
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  const day = utcDate.getUTCDay(); // 0 = dom, 1 = lun, ..., 6 = sab
  return day === 0 ? 7 : day;
}

/**
 * Retorna los strings 'YYYY-MM-DD' del lunes y domingo de la semana a la que pertenece la fecha de referencia.
 */
export function obtenerLimitesSemanaEcuador(fechaReferencia: Date | string): {
  inicioSemana: string;
  finSemana: string;
} {
  const diaRef = fechaADiaEcuador(fechaReferencia);
  const diaSemana = obtenerDiaDeSemanaIso(diaRef); // 1 = lun, 7 = dom

  const [y, m, d] = diaRef.split("-").map(Number);
  const fechaBase = new Date(Date.UTC(y, m - 1, d));

  const fechaLunes = new Date(fechaBase);
  fechaLunes.setUTCDate(fechaBase.getUTCDate() - (diaSemana - 1));

  const fechaDomingo = new Date(fechaBase);
  fechaDomingo.setUTCDate(fechaBase.getUTCDate() + (7 - diaSemana));

  const formatIso = (date: Date) => date.toISOString().slice(0, 10);

  return {
    inicioSemana: formatIso(fechaLunes),
    finSemana: formatIso(fechaDomingo),
  };
}

/**
 * Determina si una partida pertenece a la semana de la fecha de referencia (lunes a domingo, America/Guayaquil).
 */
export function perteneceASemanaEcuador(
  fechaPartida: Date | string,
  fechaReferencia: Date | string,
): boolean {
  const diaPartida = fechaADiaEcuador(fechaPartida);
  const { inicioSemana, finSemana } = obtenerLimitesSemanaEcuador(fechaReferencia);
  return diaPartida >= inicioSemana && diaPartida <= finSemana;
}

/**
 * Calcula el progreso de la semana:
 * - Horas jugadas (redondeado a 1 decimal).
 * - Días únicos jugados (múltiples partidas el mismo día = 1 día jugado).
 * - Porcentaje real y porcentaje visual (con tope al 100 %).
 */
export function calcularProgresoSemana(
  partidas: PartidaSimple[],
  metaHoras: number,
  fechaReferencia: Date | string = new Date(),
): ProgresoSemanaResultado {
  if (metaHoras <= 0) {
    return {
      horasJugadas: 0,
      metaHoras: 0,
      diasJugados: 0,
      porcentajeReal: 0,
      porcentajeVisual: 0,
    };
  }

  const partidasSemana = partidas.filter((p) => perteneceASemanaEcuador(p.fecha, fechaReferencia));

  let minutosTotales = 0;
  const diasUnicos = new Set<string>();

  for (const p of partidasSemana) {
    minutosTotales += p.duracionMinutos;
    diasUnicos.add(fechaADiaEcuador(p.fecha));
  }

  const horasJugadas = Math.round((minutosTotales / 60) * 10) / 10;
  const porcentajeReal = Math.round((horasJugadas / metaHoras) * 100);
  const porcentajeVisual = Math.min(100, porcentajeReal);

  return {
    horasJugadas,
    metaHoras,
    diasJugados: diasUnicos.size,
    porcentajeReal,
    porcentajeVisual,
  };
}

/**
 * Calcula la racha actual y mejor racha histórica:
 * - Múltiples partidas en un día = 1 día de racha.
 * - Racha viva si se jugó hoy o si se jugó ayer.
 * - Racha rota si no se jugó ni hoy ni ayer.
 */
export function calcularRachas(
  fechas: Array<Date | string>,
  fechaReferencia: Date | string = new Date(),
): RachasResultado {
  if (fechas.length === 0) {
    return { rachaActual: 0, mejorRacha: 0 };
  }

  const diasUnicosOrdenados = Array.from(new Set(fechas.map(fechaADiaEcuador))).sort();

  if (diasUnicosOrdenados.length === 0) {
    return { rachaActual: 0, mejorRacha: 0 };
  }

  // Calcular mejor racha histórica en el conjunto de días únicos
  let mejorRacha = 1;
  let rachaAcumulada = 1;

  for (let i = 1; i < diasUnicosOrdenados.length; i++) {
    const dif = diferenciaDias(diasUnicosOrdenados[i], diasUnicosOrdenados[i - 1]);
    if (dif === 1) {
      rachaAcumulada++;
      if (rachaAcumulada > mejorRacha) {
        mejorRacha = rachaAcumulada;
      }
    } else if (dif > 1) {
      rachaAcumulada = 1;
    }
  }

  // Evaluar racha actual frente a hoy / ayer en Ecuador
  const hoyStr = fechaADiaEcuador(fechaReferencia);
  const [y, m, d] = hoyStr.split("-").map(Number);
  const fechaAyer = new Date(Date.UTC(y, m - 1, d));
  fechaAyer.setUTCDate(fechaAyer.getUTCDate() - 1);
  const ayerStr = fechaAyer.toISOString().slice(0, 10);

  const diasSet = new Set(diasUnicosOrdenados);

  let rachaActual = 0;
  let diaPivote: string | null = null;

  if (diasSet.has(hoyStr)) {
    diaPivote = hoyStr;
  } else if (diasSet.has(ayerStr)) {
    diaPivote = ayerStr;
  }

  if (diaPivote) {
    rachaActual = 1;
    const [pY, pM, pD] = diaPivote.split("-").map(Number);
    let cursor = new Date(Date.UTC(pY, pM - 1, pD));

    while (true) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      const antStr = cursor.toISOString().slice(0, 10);
      if (diasSet.has(antStr)) {
        rachaActual++;
      } else {
        break;
      }
    }
  }

  return {
    rachaActual,
    mejorRacha: Math.max(mejorRacha, rachaActual),
  };
}

/**
 * Evalúa dinámicamente el estado de los hitos frente a las horas acumuladas reales.
 */
export function evaluarHitos(hitos: HitoSimple[], horasAcumuladas: number): HitoEvaluado[] {
  return hitos.map((h) => ({
    nombre: h.nombre,
    horasObjetivo: h.horasObjetivo,
    alcanzado: horasAcumuladas >= h.horasObjetivo,
  }));
}
