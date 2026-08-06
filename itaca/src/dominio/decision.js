/**
 * EL CICLO DE VIDA DE UNA DECISIÓN DELIBERADA
 *
 * La unidad fundamental de ÍTACA no es el mensaje, ni la conversación,
 * ni la tarea, ni el proyecto. Es la decisión deliberada.
 *
 * Este módulo es la única definición de qué significa eso. Todo lo demás
 * del sistema —la sala, la memoria, y algún día el backend— es una vista
 * sobre estas estructuras, nunca al revés.
 *
 * No hay dependencias aquí. Ni React, ni red, ni almacenamiento.
 * Si este archivo necesita importar algo, la arquitectura se ha roto.
 */

/**
 * Los cuatro estados por los que puede pasar una decisión.
 *
 * Nota deliberada: RESUELTA no es un estado terminal. Una decisión que no
 * puede volver a abrirse no es una decisión, es un dogma. El paso a
 * REVISABLE es lo que distingue a ÍTACA de un archivo de actas.
 */
export const ESTADOS = {
  PLANTEADA: 'planteada',
  EN_DELIBERACION: 'en_deliberacion',
  RESUELTA: 'resuelta',
  REVISABLE: 'revisable',
};

/** Orden narrativo del ciclo. Lo usa la sala para dibujar el progreso. */
export const CICLO = [
  ESTADOS.PLANTEADA,
  ESTADOS.EN_DELIBERACION,
  ESTADOS.RESUELTA,
  ESTADOS.REVISABLE,
];

export const ETIQUETA_ESTADO = {
  [ESTADOS.PLANTEADA]: 'Planteada',
  [ESTADOS.EN_DELIBERACION]: 'En deliberación',
  [ESTADOS.RESUELTA]: 'Resuelta',
  [ESTADOS.REVISABLE]: 'Revisable',
};

/** Transiciones legales. Cualquier otra es un error del sistema, no del usuario. */
const TRANSICIONES = {
  [ESTADOS.PLANTEADA]: [ESTADOS.EN_DELIBERACION],
  [ESTADOS.EN_DELIBERACION]: [ESTADOS.RESUELTA, ESTADOS.PLANTEADA],
  [ESTADOS.RESUELTA]: [ESTADOS.REVISABLE],
  [ESTADOS.REVISABLE]: [ESTADOS.EN_DELIBERACION],
};

export function puedeTransicionar(desde, hacia) {
  return (TRANSICIONES[desde] ?? []).includes(hacia);
}

/**
 * Las posturas que un miembro del Consejo puede sostener sobre una decisión.
 *
 * "Se abstiene" existe a propósito y no es lo mismo que no haber hablado:
 * abstenerse es una posición, el silencio es una ausencia. ÍTACA debe poder
 * distinguirlas o la calidad de la deliberación no es medible.
 */
export const POSTURAS = {
  PROPONE: 'propone',
  A_FAVOR: 'a_favor',
  A_FAVOR_CON_RESERVAS: 'a_favor_con_reservas',
  EN_CONTRA: 'en_contra',
  SE_ABSTIENE: 'se_abstiene',
};

export const ETIQUETA_POSTURA = {
  [POSTURAS.PROPONE]: 'Propone',
  [POSTURAS.A_FAVOR]: 'A favor',
  [POSTURAS.A_FAVOR_CON_RESERVAS]: 'A favor, con reservas',
  [POSTURAS.EN_CONTRA]: 'En contra',
  [POSTURAS.SE_ABSTIENE]: 'Se abstiene',
};

/**
 * LAS INVARIANTES.
 *
 * Esto no es validación defensiva de datos. Es la Regla de Oro escrita en
 * código: define qué distingue una decisión deliberada de una ocurrencia
 * con fecha. Si una decisión del Consejo no pasa estas comprobaciones,
 * el Consejo no ha deliberado todavía.
 *
 * Devuelve una lista de incumplimientos. Vacía = la decisión se sostiene.
 */
export function auditar(decision) {
  const fallos = [];
  const posiciones = decision.posiciones ?? [];
  const alternativas = decision.alternativasDescartadas ?? [];
  const revisarSi = decision.revisarSi ?? [];

  if (!decision.id) fallos.push('La decisión no tiene identidad.');
  if (!decision.pregunta) {
    fallos.push('La decisión no formula una pregunta. Sin pregunta no hay decisión, hay un anuncio.');
  }

  const deliberada =
    decision.estado === ESTADOS.EN_DELIBERACION ||
    decision.estado === ESTADOS.RESUELTA ||
    decision.estado === ESTADOS.REVISABLE;

  if (deliberada) {
    // Una sola voz no es deliberación. Es un monólogo con testigos.
    const voces = new Set(posiciones.map((p) => p.miembro));
    if (voces.size < 2) {
      fallos.push('Una sola voz. Esto no es deliberación, es un monólogo.');
    }
    // Si todos dicen lo mismo, nadie ha pensado. Sócrates existirá por esto.
    const posturas = new Set(posiciones.map((p) => p.postura));
    if (voces.size >= 2 && posturas.size < 2) {
      fallos.push('Unanimidad sin fricción: ninguna postura discrepa de otra.');
    }
    if (posiciones.some((p) => !p.argumento)) {
      fallos.push('Hay posturas sin argumento. La postura sin argumento no cuenta.');
    }
  }

  if (decision.estado === ESTADOS.RESUELTA || decision.estado === ESTADOS.REVISABLE) {
    if (!decision.resolucion?.texto) {
      fallos.push('Resuelta sin resolución escrita.');
    }
    // Si no se descartó nada, no se eligió nada.
    if (alternativas.length === 0) {
      fallos.push('No consta ninguna alternativa descartada. Si no se descartó nada, no se decidió: se reaccionó.');
    }
    // La invariante que hace a ÍTACA distinta de un archivo de actas.
    if (revisarSi.length === 0) {
      fallos.push('No consta qué nos haría cambiar de opinión. Una decisión irrevisable es un dogma.');
    }
  }

  return fallos;
}

/** Azúcar de lectura para la sala. */
export function estaDeliberada(decision) {
  return auditar(decision).length === 0;
}

export function posicionDe(decision, idMiembro) {
  return (decision.posiciones ?? []).find((p) => p.miembro === idMiembro) ?? null;
}
