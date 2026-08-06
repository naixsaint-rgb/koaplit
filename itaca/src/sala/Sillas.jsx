import { MIEMBROS } from '../dominio/consejo.js';
import { asiento } from './geometria.js';

/**
 * LAS SILLAS.
 *
 * Butaca de nogal con lino: brazos, respaldo con travesaño alto y patas
 * ligeramente abiertas. La madera es el segundo valor oscuro de la sala
 * después del artesonado, y hace falta: rodear una mesa clarísima de sillas
 * clarísimas devuelve la escena a la ilustración plana.
 *
 * Se pintan en dos capas: las del otro lado de la mesa antes que ella, las de
 * este lado después. Es lo único que hace que la sala tenga fondo.
 *
 * No son interactivas: quien recibe el clic y el foco es la ficha del miembro
 * (`Ficha.jsx`). Duplicar el objetivo daría dos paradas de tabulador para lo
 * mismo, y la silla no sabría decir su nombre a un lector de pantalla.
 */
export function Sillas({ plano, elegido }) {
  const enEstePlano = MIEMBROS.filter((m) => asiento(m.id).fondo === (plano === 'fondo'));
  const suf = plano;

  return (
    <svg
      className={`capa sillas sillas--${plano}`}
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`nogalSilla-${suf}`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#8a6034" />
          <stop offset="55%" stopColor="#6b4526" />
          <stop offset="100%" stopColor="#472c17" />
        </linearGradient>
        <linearGradient id={`lino-${suf}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#f3ead5" />
          <stop offset="58%" stopColor="#e2d5b9" />
          <stop offset="100%" stopColor="#c4b394" />
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
            {/* sombra en el suelo */}
            <ellipse cx="4" cy="86" rx="74" ry="14" fill="#7d6a49" opacity="0.26" />

            {/* montantes del respaldo */}
            <rect x="-64" y="-104" width="13" height="118" rx="5" fill={`url(#nogalSilla-${suf})`} />
            <rect x="51" y="-104" width="13" height="118" rx="5" fill={`url(#nogalSilla-${suf})`} />
            {/* travesaño alto */}
            <rect x="-68" y="-112" width="136" height="15" rx="7" fill={`url(#nogalSilla-${suf})`} />

            {/* almohadón del respaldo */}
            <rect
              className="respaldo"
              x="-54"
              y="-94"
              width="108"
              height="92"
              rx="17"
              fill={`url(#lino-${suf})`}
              stroke="#b3a07c"
              strokeWidth="1.8"
            />

            {/* brazos */}
            <path d="M-78 -22 q0 -12 12 -12 h12 v13 h-8 q-4 0 -4 5 v22 h-12 Z" fill={`url(#nogalSilla-${suf})`} />
            <path d="M78 -22 q0 -12 -12 -12 h-12 v13 h8 q4 0 4 5 v22 h12 Z" fill={`url(#nogalSilla-${suf})`} />

            {/* asiento */}
            <rect x="-72" y="4" width="144" height="22" rx="10" fill={`url(#lino-${suf})`} stroke="#b3a07c" strokeWidth="1.6" />
            <rect x="-76" y="22" width="152" height="12" rx="6" fill={`url(#nogalSilla-${suf})`} />

            {/* patas, ligeramente abiertas */}
            <path d="M-62 34 l-10 52 h12 l8 -52 Z" fill={`url(#nogalSilla-${suf})`} />
            <path d="M62 34 l10 52 h-12 l-8 -52 Z" fill={`url(#nogalSilla-${suf})`} />
            <path d="M-30 34 l-4 44 h9 l3 -44 Z" fill={`url(#nogalSilla-${suf})`} opacity="0.75" />
            <path d="M30 34 l4 44 h-9 l-3 -44 Z" fill={`url(#nogalSilla-${suf})`} opacity="0.75" />
          </g>
        );
      })}
    </svg>
  );
}
