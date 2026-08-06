import { MESA } from './geometria.js';

/**
 * LA MESA.
 *
 * No es mobiliario y no representa nada: es el sitio donde ocurre la
 * deliberación. Por eso el documento vivo se apoya encima —ver `Pliego.jsx`—
 * y no en una barra aparte. Al muro sube el título, que es la identidad de la
 * decisión; el trabajo se queda en la mesa.
 *
 * Monumental quiere decir tres cosas concretas, no «grande»:
 *   · escala — 1400 unidades de ancho, más de dos tercios de la sala;
 *   · canto — un tablero de 46 unidades de grueso, no una elipse sin espesor;
 *   · asiento — sombra de contacto bajo el canto, o la mesa flota.
 *
 * Se dibuja en su propia capa porque tiene que quedar entre las sillas del
 * fondo y las del primer término. Sin ese orden, la sala se aplana.
 */
export function Mesa() {
  const { x, y, rx, ry } = MESA;
  const grueso = 46;

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
        <radialGradient id="marmol" cx="0.3" cy="0.16" r="0.95">
          <stop offset="0%" stopColor="#fffcf5" />
          <stop offset="46%" stopColor="#f4ecda" />
          <stop offset="100%" stopColor="#d3bf9b" />
        </radialGradient>

        <linearGradient id="cantoMesa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7dbc0" />
          <stop offset="34%" stopColor="#c9b795" />
          <stop offset="100%" stopColor="#907c58" />
        </linearGradient>

        <filter id="contacto" x="-25%" y="-120%" width="150%" height="340%">
          <feGaussianBlur stdDeviation="26" />
        </filter>

        <filter id="veta" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {/* sombra de contacto: sin ella el tablero flota sobre el travertino */}
      <ellipse cx={x + 46} cy={y + ry + 26} rx={rx * 0.9} ry="46" fill="#7d6a49" opacity="0.34" filter="url(#contacto)" />

      {/* canto del tablero */}
      <path
        d={`M${x - rx} ${y} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v${grueso} a${rx} ${ry} 0 0 1 ${-rx * 2} 0 Z`}
        fill="url(#cantoMesa)"
      />
      {/* filete de luz en el borde del canto, por el lado que recibe la luz */}
      <path
        d={`M${x - rx} ${y} a${rx} ${ry} 0 0 0 ${rx} ${ry}`}
        fill="none"
        stroke="#fdf7e8"
        strokeWidth="3"
        opacity="0.5"
      />

      {/* tablero */}
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#marmol)" />

      {/* veteado: fino, direccional y desigual, como el travertino de verdad */}
      <g stroke="#bda683" fill="none" filter="url(#veta)">
        <path d={`M${x - 560} ${y - 120} q250 52 520 18 q250 -32 540 44`} strokeWidth="1.8" opacity="0.5" />
        <path d={`M${x - 610} ${y - 34} q290 40 560 6 q230 -30 480 30`} strokeWidth="1.2" opacity="0.36" />
        <path d={`M${x - 520} ${y + 96} q270 -40 540 -12 q210 22 430 -26`} strokeWidth="1.6" opacity="0.44" />
        <path d={`M${x - 430} ${y + 172} q240 -30 470 -6`} strokeWidth="1.1" opacity="0.3" />
        <path d={`M${x - 300} ${y - 190} q190 30 360 8`} strokeWidth="1.2" opacity="0.34" />
        <path d={`M${x + 120} ${y - 150} q140 44 300 34`} strokeWidth="1" opacity="0.28" />
      </g>

      {/* brillo especular: la mancha de luz de la columnata sobre el pulido */}
      <ellipse cx={x - 330} cy={y - 96} rx="280" ry="88" fill="#fffdf6" opacity="0.36" filter="url(#contacto)" />

      {/* cuenco de bronce en el centro geométrico de la mesa */}
      <g>
        <ellipse cx={x} cy={y + 8} rx="62" ry="19" fill="#7d6a49" opacity="0.34" filter="url(#veta)" />
        <path d={`M${x - 56} ${y - 6} a56 17 0 0 0 112 0 a56 17 0 0 0 -112 0`} fill="#9a7b46" />
        <path d={`M${x - 56} ${y - 6} a56 17 0 0 0 112 0 q-8 22 -56 22 q-48 0 -56 -22 Z`} fill="#7c6034" />
        <path d={`M${x - 42} ${y - 10} a42 12 0 0 1 46 -6`} fill="none" stroke="#d6b479" strokeWidth="3" opacity="0.8" />
      </g>
    </svg>
  );
}
