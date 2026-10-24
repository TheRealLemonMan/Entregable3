export const plataformas = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export type Plataforma = (typeof plataformas)[number];
export const generos = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export type Genero = (typeof generos)[number];
export const estados = ["jugando", "pausado", "completado", "abandonado"] as const;
export type EstadoVideojuego = (typeof estados)[number];

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  portadaUrl?: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface VideojuegoInput {
  nombre: string;
  portadaUrl?: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: Array<{ nombre: string; obtenido?: boolean }>;
}

export interface Partida {
  _id: string;
  videojuego: Videojuego | string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface PartidaInput {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}
