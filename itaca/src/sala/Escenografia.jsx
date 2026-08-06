import { HORIZONTE } from './geometria.js';

/**
 * LA VILLA.
 *
 * Lo que abrió la sala no fue aclarar la paleta: fue darle un exterior. La luz
 * entra por la arcada de la izquierda, cruza el suelo y se apaga a la derecha.
 * Toda la iluminación de la sala —los degradados del muro, el derrame sobre el
 * suelo, el brillo del mármol— obedece a esa única dirección. Dos fuentes de
 * luz habrían devuelto la sensación de interior cerrado.
 *
 * Todo es SVG dibujado a mano: cero imágenes, cero peticiones de red. Perseguir
 * el fotorrealismo de las referencias con trazados a mano llevaría a lo
 * *uncanny* —casi real y por eso peor—, así que esto es luz y geometría
 * arquitectónicas, no fotografía.
 *
 * Nada de aquí es interactivo ni accesible: es el edificio.
 */
export function Escenografia() {
  return (
    <svg
      className="capa escenografia"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0c6cd" />
          <stop offset="46%" stopColor="#d4e0dd" />
          <stop offset="100%" stopColor="#f1e8d6" />
        </linearGradient>

        <linearGradient id="mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b97a2" />
          <stop offset="100%" stopColor="#a7bbbc" />
        </linearGradient>

        {/* el punto más claro del muro cae donde entra la luz */}
        <linearGradient id="muro" x1="0.1" y1="0.1" x2="0.95" y2="0.9">
          <stop offset="0%" stopColor="#faf5ea" />
          <stop offset="42%" stopColor="#ece2ce" />
          <stop offset="100%" stopColor="#d4c5a8" />
        </linearGradient>

        <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d5c7aa" />
          <stop offset="46%" stopColor="#e9dfcb" />
          <stop offset="100%" stopColor="#f2eade" />
        </linearGradient>

        <linearGradient id="piedra" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#f0e7d4" />
          <stop offset="100%" stopColor="#cfbf9f" />
        </linearGradient>

        <filter id="difusa" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>

        <filter id="aire" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="36" />
        </filter>

        {/* sin grano, una superficie clara y grande delata que es CSS */}
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <clipPath id="vanoA">
          <path d="M78 470 V214 a111 111 0 0 1 222 0 V470 Z" />
        </clipPath>
        <clipPath id="vanoB">
          <path d="M348 470 V226 a100 100 0 0 1 200 0 V470 Z" />
        </clipPath>
      </defs>

      <rect x="-1000" y="-400" width="3920" height="1880" fill="url(#muro)" />

      {/* pilastra y muro del lado derecho */}
      <rect x="1548" y="-400" width="1372" height={HORIZONTE + 400} fill="#e0d3b8" />
      <rect x="1540" y="-400" width="22" height={HORIZONTE + 400} fill="#f2e9d7" />
      <rect x="1528" y="-400" width="12" height={HORIZONTE + 400} fill="#d5c6a8" />

      {/* hornacina recortada por el borde, como en las referencias */}
      <g>
        <path d="M1716 470 V240 a84 84 0 0 1 168 0 V470 Z" fill="#cdbc9c" />
        <path d="M1716 470 V240 a84 84 0 0 1 168 0 V470" fill="none" stroke="#bcab89" strokeWidth="5" />
        <g fill="url(#piedra)" filter="url(#difusa)">
          <rect x="1760" y="424" width="80" height="46" />
          <rect x="1750" y="412" width="100" height="14" rx="3" />
          <path d="M1772 292 q-20 44 -20 128 h96 q0 -84 -20 -128 q-28 -14 -56 0 Z" />
          <rect x="1791" y="252" width="18" height="36" />
          <ellipse cx="1800" cy="236" rx="23" ry="27" />
        </g>
        <g stroke="#b8a582" strokeWidth="2.4" fill="none" opacity="0.85">
          <path d="M1786 310 q-11 60 -12 112" />
          <path d="M1814 308 q9 60 11 114" />
        </g>
      </g>

      {/* suelo */}
      <path d={`M-1000 ${HORIZONTE} H2920 V1480 H-1000 Z`} fill="url(#suelo)" />
      <rect x="-1000" y={HORIZONTE - 8} width="3920" height="10" fill="#bfad8b" opacity="0.5" />

      {/* juntas en fuga: el suelo es lo que crea la profundidad */}
      <g stroke="#c6b48f" strokeWidth="1.6" opacity="0.4">
        <path d={`M-1400 1480 L866 ${HORIZONTE + 2}`} />
        <path d={`M-760 1480 L912 ${HORIZONTE + 2}`} />
        <path d={`M-60 1480 L952 ${HORIZONTE + 2}`} />
        <path d={`M900 1480 L992 ${HORIZONTE + 2}`} />
        <path d={`M1900 1480 L1034 ${HORIZONTE + 2}`} />
        <path d={`M2600 1480 L1078 ${HORIZONTE + 2}`} />
        <path d={`M3300 1480 L1122 ${HORIZONTE + 2}`} />
      </g>
      <g stroke="#c6b48f" strokeWidth="1.6" opacity="0.26">
        <path d="M-1000 566 H2920" />
        <path d="M-1000 700 H2920" />
        <path d="M-1000 892 H2920" />
      </g>

      {/* la arcada: aquí empieza todo */}
      <g>
        <g clipPath="url(#vanoA)">
          <rect x="78" y="100" width="222" height="370" fill="url(#cielo)" />
          <rect x="78" y="356" width="222" height="114" fill="url(#mar)" />
          <path d="M78 356 q56 -28 118 -9 q58 19 104 7 v10 H78 Z" fill="#8d998f" opacity="0.8" />
          <g fill="#47563e" opacity="0.9">
            <path d="M132 358 q-11 -68 11 -124 q22 56 11 124 Z" />
            <path d="M218 358 q-14 -86 14 -156 q28 70 14 156 Z" />
            <path d="M266 358 q-9 -58 9 -106 q18 48 9 106 Z" />
          </g>
        </g>
        <g clipPath="url(#vanoB)">
          <rect x="348" y="112" width="200" height="358" fill="url(#cielo)" />
          <rect x="348" y="360" width="200" height="110" fill="url(#mar)" />
          <path d="M348 360 q52 -20 102 -7 q50 15 94 5 v9 H348 Z" fill="#8d998f" opacity="0.75" />
          <g fill="#47563e" opacity="0.85">
            <path d="M392 362 q-12 -74 12 -136 q24 62 12 136 Z" />
            <path d="M482 362 q-9 -52 9 -96 q18 44 9 96 Z" />
          </g>
        </g>

        <g fill="none" stroke="#cbbb99" strokeWidth="8">
          <path d="M78 470 V214 a111 111 0 0 1 222 0 V470" />
          <path d="M348 470 V226 a100 100 0 0 1 200 0 V470" />
        </g>
        <rect x="300" y="90" width="48" height="380" fill="#eae0c9" />
        <rect x="294" y="74" width="60" height="20" rx="3" fill="#ded1b4" />
        <rect x="30" y="90" width="48" height="380" fill="#f0e7d3" />
        <rect x="24" y="74" width="60" height="20" rx="3" fill="#e4d8be" />
        <rect x="548" y="94" width="36" height="376" fill="#e1d5bb" />
        <rect x="542" y="78" width="48" height="20" rx="3" fill="#d6c8aa" />
      </g>

      {/* la luz entra y se derrama por el suelo hacia la derecha */}
      <polygon
        points={`110,${HORIZONTE} 600,${HORIZONTE} 1320,1480 220,1480`}
        fill="#fffdf7"
        opacity="0.66"
        filter="url(#aire)"
      />
      <ellipse cx="400" cy="300" rx="470" ry="360" fill="#fff9ec" opacity="0.34" filter="url(#aire)" />

      {/* olivos, plantados contra el muro */}
      {[
        { x: 520, e: 1 },
        { x: 1430, e: 0.92 },
      ].map(({ x, e }) => (
        <g key={x} transform={`translate(${x} ${HORIZONTE}) scale(${e})`}>
          <path d="M-30 0 h60 l-8 -60 h-44 Z" fill="#d2c3a3" />
          <rect x="-34" y="-72" width="68" height="14" rx="3" fill="#dccfb2" />
          <rect x="-4" y="-150" width="8" height="80" fill="#8a6b44" />
          <g opacity="0.9">
            <ellipse cx="-24" cy="-158" rx="35" ry="24" fill="#68765a" />
            <ellipse cx="22" cy="-166" rx="37" ry="26" fill="#5c6b4f" />
            <ellipse cx="-2" cy="-200" rx="43" ry="29" fill="#71805f" />
            <ellipse cx="-37" cy="-188" rx="23" ry="17" fill="#5c6b4f" />
            <ellipse cx="33" cy="-194" rx="22" ry="16" fill="#68765a" />
          </g>
        </g>
      ))}

      <rect x="-1000" y="-400" width="3920" height="1880" filter="url(#grano)" opacity="0.05" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}
