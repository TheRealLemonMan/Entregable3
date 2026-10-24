export const plataformas = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export type Plataforma = (typeof plataformas)[number];

export const generos = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export type Genero = (typeof generos)[number];

export const estados = ["jugando", "pausado", "completado", "abandonado"] as const;
export type EstadoVideojuego = (typeof estados)[number];

export interface LogroInput {
  nombre: string;
  obtenido?: boolean;
}

export interface VideojuegoInput {
  nombre: string;
  portadaUrl?: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros?: LogroInput[];
}

export interface PartidaInput {
  videojuego: string;
  fecha: string | Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}
