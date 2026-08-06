import { MESA } from './geometria.js';

/**
 * LA MESA.
 *
 * No es mobiliario y no representa nada: es el sitio donde ocurre la
 * deliberación. Por eso el documento vivo de la decisión se apoya encima
 * —ver `Pliego.jsx`— y no en una barra aparte. Al muro solo sube el título,
 * que es la identidad de la decisión; el trabajo se queda en la mesa.
 *
 * Se dibuja en su propia capa porque tiene que quedar entre las sillas del
 * fondo y las del primer término. Sin ese orden, la sala se aplana.
 */
export function Mesa() {
  const { x, y, rx, ry } = MESA;

  return (
    <svg
      className="capa mesa"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* el brillo cae arriba a la izquierda, como toda la luz de la sala */}
        <radialGradient id="marmol" cx="0.33" cy="0.18" r="0.92">
          <stop offset="0%" stopColor="#fefbf4" />
          <stop offset="52%" stopColor="#f0e8d6" />
          <stop offset="100%" stopColor="#ddceb0" />
        </radialGradient>

        <linearGradient id="cantoMesa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d2c2a1" />
          <stop offset="100%" stopColor="#a08a63" />
        </linearGradient>

        <filter id="asiento" x="-25%" y="-70%" width="150%" height="260%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
      </defs>

      {/* la sombra la asienta en el suelo; sin ella la mesa flota */}
      <ellipse cx={x} cy={y + 250} rx={rx * 0.86} ry="56" fill="#8d7a56" opacity="0.3" filter="url(#asiento)" />

      <path
        d={`M${x - rx} ${y} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v34 a${rx} ${ry} 0 0 1 ${-rx * 2} 0 Z`}
        fill="url(#cantoMesa)"
      />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#marmol)" />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke="#fffdf6" strokeWidth="2.5" opacity="0.9" />

      {/* vetas: discretas, o el mármol compite con el texto que sostiene */}
      <g stroke="#c8b48f" strokeWidth="1.5" fill="none" opacity="0.42">
        <path d={`M${x - 470} ${y - 96} q220 40 460 12 q240 -28 470 30`} />
        <path d={`M${x - 420} ${y + 150} q250 -34 490 -8 q210 26 380 -22`} />
        <path d={`M${x - 330} ${y - 178} q190 26 350 8`} />
      </g>
    </svg>
  );
}
