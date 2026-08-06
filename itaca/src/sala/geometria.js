/**
 * LA GEOMETRÍA DE LA SALA.
 *
 * Dónde se sienta cada miembro no es una propiedad del Consejo: es una decisión
 * de la vista. Tenerlo en `src/dominio/consejo.js` era un error del Sprint 1 —
 * ponía en el dominio una cifra que solo existe porque hay una sala. Aquí sí
 * pertenece, y el dominio ya no sabe que existen las sillas.
 *
 * Todas las coordenadas están en el sistema de la escenografía: 1920×1080, el
 * mismo del `viewBox` de los SVG. La hoja las convierte a unidades `--u`.
 */

/** Donde el muro se encuentra con el suelo. Por encima, la sala; por debajo, el suelo. */
export const HORIZONTE = 470;

/** La mesa. Vista desde algo por encima del ojo, para que se vea la superficie. */
export const MESA = { x: 960, y: 800, rx: 660, ry: 265 };

/** El anillo de sillas, por fuera del canto de la mesa. */
const SILLAS = { rx: 700, ry: 310 };

/**
 * Ángulo de cada silla, en grados. -90 es la cabecera del fondo.
 * Odiseo preside desde el fondo, bajo la decisión que planteó. El sur queda
 * libre a propósito: por ahí entra la mirada.
 */
export const ANGULO = {
  odiseo: -90,
  atenea: -146,
  hermes: -34,
  mnemosine: 146,
  socrates: 34,
};

/**
 * Proyecta una silla con profundidad.
 *
 * `d` va de 0 (fondo) a 1 (primer término) y gobierna dos cosas a la vez: el
 * tamaño y el orden de dibujo. Sin `fondo`, las sillas del otro lado de la mesa
 * se dibujarían encima de ella y la sala volvería a ser plana.
 */
export function asiento(id) {
  const r = (ANGULO[id] * Math.PI) / 180;
  const d = (Math.sin(r) + 1) / 2;
  return {
    x: MESA.x + SILLAS.rx * Math.cos(r),
    y: MESA.y + SILLAS.ry * Math.sin(r),
    escala: 0.64 + 0.62 * d,
    fondo: d < 0.5,
  };
}

/**
 * Dónde se apoya la ficha de cada miembro.
 *
 * Todas caen sobre el suelo o sobre muro liso, nunca sobre el mar ni sobre los
 * cipreses: son las «zonas de calma» del fondo. Un rótulo sobre una textura es
 * un rótulo ilegible, y aquí la legibilidad manda sobre la composición.
 */
export const FICHA = {
  odiseo: { x: 960, y: 336, anclaje: 'centro' },
  atenea: { x: 315, y: 574, anclaje: 'derecha' },
  hermes: { x: 1610, y: 574, anclaje: 'izquierda' },
  mnemosine: { x: 285, y: 902, anclaje: 'derecha' },
  socrates: { x: 1640, y: 902, anclaje: 'izquierda' },
};

/**
 * El pliego: el documento vivo, apoyado sobre el mármol.
 *
 * Las medidas no son estéticas, son geométricas: con esta anchura y esta
 * inclinación, los cuatro cantos del pliego caen dentro de la elipse de la
 * mesa. Si se agranda, el documento sobresale por el canto y deja de estar
 * apoyado en algo.
 */
export const PLIEGO = { x: 960, y: 786, ancho: 700, alto: 402, inclinacion: 22, fuga: 1700 };
