import { ITACA_0001 } from './itaca-0001.js';
import { ITACA_0002 } from './itaca-0002.js';

/**
 * La memoria del Consejo, en su única forma canónica.
 *
 * Las actas de docs/decisiones/ se GENERAN desde aquí (`npm run actas`).
 * Nunca al revés, y nunca las dos a mano: dos copias de una decisión son,
 * antes o después, dos decisiones distintas.
 */
export const DECISIONES = [ITACA_0001, ITACA_0002];

/** La decisión que está hoy sobre la mesa de la sala. */
export const EN_LA_MESA = 'ÍTACA-0001';

export const decisionPorId = (id) => DECISIONES.find((d) => d.id === id) ?? null;
