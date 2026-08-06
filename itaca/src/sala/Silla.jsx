import { ETIQUETA_POSTURA, POSTURAS } from '../dominio/decision.js';
import { ANGULO_SILLA } from '../dominio/consejo.js';

/** Radios de la elipse de sillas, en % de la escena. */
const RADIO_X = 32;
const RADIO_Y = 39;

function tono(postura) {
  if (!postura) return 'silencio';
  if (postura === POSTURAS.EN_CONTRA) return 'contra';
  return 'favor';
}

export function Silla({ miembro, posicion, elegida, onElegir }) {
  const rad = (ANGULO_SILLA[miembro.id] * Math.PI) / 180;
  const estilo = {
    left: `${50 + RADIO_X * Math.cos(rad)}%`,
    top: `${50 + RADIO_Y * Math.sin(rad)}%`,
  };

  /*
   * El silencio no es abstención. Un miembro que no estaba presente no dice
   * "me abstengo": no dice nada, y la sala tiene que mostrar esa diferencia
   * o el Consejo acabará leyendo ausencias como consentimiento.
   */
  const etiqueta = posicion
    ? ETIQUETA_POSTURA[posicion.postura]
    : miembro.presente
      ? 'No se pronunció'
      : 'Silla vacía';

  return (
    <button
      type="button"
      className="silla"
      style={estilo}
      data-elegida={elegida ? 'si' : 'no'}
      data-presente={miembro.presente ? 'si' : 'no'}
      aria-pressed={elegida}
      onClick={() => onElegir(miembro.id)}
    >
      {/*
        La silla de quien todavía no se ha incorporado se dibuja vacía, sin
        glifo: un asiento libre en la mesa dice más que un icono con un signo
        de interrogación, y no rompe la paleta cálida de la sala.
      */}
      <span className="glifo" aria-hidden="true">
        {miembro.presente ? miembro.glifo : ''}
      </span>
      <span className="nombre">{miembro.nombre}</span>
      <span className="rol">{miembro.rol}</span>
      <span className="postura" data-tono={tono(posicion?.postura)}>
        {etiqueta}
      </span>
    </button>
  );
}
