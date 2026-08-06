import { MIEMBROS } from '../dominio/consejo.js';
import { asiento } from './geometria.js';

/**
 * LAS SILLAS.
 *
 * Se pintan en dos capas: las del otro lado de la mesa antes que ella, las de
 * este lado después. Es lo único que hace que la sala tenga fondo — sin ese
 * corte, todas flotarían sobre el mármol y volveríamos al alzado plano.
 *
 * No son interactivas: quien recibe el clic y el foco es la ficha del miembro
 * (`Ficha.jsx`). Duplicar el objetivo daría dos paradas de tabulador para lo
 * mismo, y la silla no sabría decir su nombre a un lector de pantalla.
 */
export function Sillas({ plano, elegido }) {
  const enEstePlano = MIEMBROS.filter((m) => asiento(m.id).fondo === (plano === 'fondo'));

  return (
    <svg
      className={`capa sillas sillas--${plano}`}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`madera-${plano}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#a97b48" />
          <stop offset="100%" stopColor="#7a5530" />
        </linearGradient>
        <linearGradient id={`tela-${plano}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#efe5d0" />
          <stop offset="100%" stopColor="#d4c4a3" />
        </linearGradient>
      </defs>

      {enEstePlano.map((m) => {
        const { x, y, escala } = asiento(m.id);
        return (
          <g
            key={m.id}
            className="silla"
            data-elegida={elegido === m.id ? 'si' : 'no'}
            data-presente={m.presente ? 'si' : 'no'}
            transform={`translate(${x} ${y}) scale(${escala})`}
          >
            <rect
              className="respaldo"
              x="-62"
              y="-98"
              width="124"
              height="106"
              rx="30"
              fill={`url(#tela-${plano})`}
              stroke="#b6a078"
              strokeWidth="2.2"
            />
            <rect x="-70" y="-6" width="140" height="22" rx="10" fill={`url(#madera-${plano})`} />
            <rect x="-58" y="14" width="12" height="68" rx="4" fill={`url(#madera-${plano})`} />
            <rect x="46" y="14" width="12" height="68" rx="4" fill={`url(#madera-${plano})`} />
          </g>
        );
      })}
    </svg>
  );
}
