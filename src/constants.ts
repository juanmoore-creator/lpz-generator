import type { SurfaceType } from './types/index';

export const SURFACE_TYPES: SurfaceType[] = ['Jardín', 'Patio', 'Terraza', 'Balcón', 'Ninguno'];

export const DEFAULT_FACTORS: Record<SurfaceType, number> = {
    'Jardín': 0.25,
    'Patio': 0.20,
    'Terraza': 0.15,
    'Balcón': 0.10,
    'Ninguno': 0
};
