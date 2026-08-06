import { ETIQUETA_POSTURA, POSTURAS } from '../dominio/decision.js';
import { FICHA } from './geometria.js';

/**
 * La ficha de un miembro: su sitio en la mesa, y el único objetivo interactivo
 * de la sala. La silla de al lado es dibujo; esto es el botón.
 *
 * El silencio no es abstención. Un miembro que no estaba presente no dice «me
 * abstengo»: no dice nada, y la sala tiene que mostrar esa diferencia o el
 * Consejo acabará leyendo ausencias como consentimiento.
 */
export function Ficha({ miembro, posicion, elegida, onElegir }) {
  const { x, y, anclaje } = FICHA[miembro.id];

  const sitio =
    anclaje === 'derecha'
      ? { right: `calc(${1920 - x} * var(--u))`, top: `calc(${y} * var(--u))` }
      : anclaje === 'izquierda'
        ? { left: `calc(${x} * var(--u))`, top: `calc(${y} * var(--u))` }
        : { left: '50%', top: `calc(${y} * var(--u))`, transform: 'translateX(-50%)' };

  const etiqueta = posicion
    ? ETIQUETA_POSTURA[posicion.postura]
    : miembro.presente
      ? 'No se pronunció'
      : 'Silla vacía';

  return (
    <button
      type="button"
      className="ficha"
      style={sitio}
      data-anclaje={anclaje}
      data-elegida={elegida ? 'si' : 'no'}
      data-presente={miembro.presente ? 'si' : 'no'}
      data-contra={posicion?.postura === POSTURAS.EN_CONTRA ? 'si' : 'no'}
      aria-pressed={elegida}
      onClick={() => onElegir(miembro.id)}
    >
      {/*
        Sin emoji. Eran lo más de aplicación que le quedaba a la sala, y el
        Consejo lo pidió explícitamente: nada de iconos modernos. Un filete de
        bronce y el nombre en Cormorant dicen lo mismo sin sacar a nadie de la
        villa. La silla vacía se distingue por el filete hueco.
      */}
      <span className="filete" aria-hidden="true" />
      <span className="texto">
        <span className="nombre">{miembro.nombre}</span>
        <span className="rol">{miembro.rol}</span>
        <span className="postura">{etiqueta}</span>
      </span>
    </button>
  );
}
