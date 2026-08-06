import { HORIZONTE } from './geometria.js';

/** Punto de fuga de la sala. Todo lo que huye, huye aquí. */
const FUGA = { x: 960, y: HORIZONTE };

/** Arranque de la columnata: por debajo del arquitrabe, por encima del suelo. */
const IMPOSTA = 178;

/**
 * LA VILLA.
 *
 * Tres cosas hacen que esto se lea como arquitectura y no como ilustración, y
 * ninguna es el color:
 *
 *   1. RANGO TONAL. La versión anterior vivía entera en una franja pálida, y
 *      por eso parecía dibujo. Una fotografía tiene negros. El artesonado de
 *      nogal es el ancla oscura: sin algo oscuro arriba, la luz de abajo no es
 *      luz, es solo papel claro.
 *   2. FUGA ÚNICA. Artesonado, suelo y sombras arrojadas convergen en el mismo
 *      punto. Dos perspectivas distintas se notan aunque no se sepa por qué.
 *   3. REFLEJOS. El travertino pulido devuelve las columnas y el vano. Es la
 *      pista de material más barata y la más convincente: una superficie que
 *      no refleja nada no es piedra, es relleno.
 *
 * La luz sigue entrando por un solo sitio —la columnata de la izquierda— y
 * todo degradado del archivo obedece a esa dirección.
 *
 * Todo es SVG dibujado a mano: ninguna imagen, ninguna petición de red. No se
 * busca fotorrealismo —a mano se llega a lo *uncanny*, casi real y por eso
 * peor—, sino arquitectura: proporción, materia y luz.
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
          <stop offset="0%" stopColor="#7ba5bd" />
          <stop offset="50%" stopColor="#bcd3da" />
          <stop offset="100%" stopColor="#eee2cc" />
        </linearGradient>

        <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#456b7d" />
          <stop offset="58%" stopColor="#6a8f9b" />
          <stop offset="100%" stopColor="#8dabaf" />
        </linearGradient>

        {/* caliza: lo más claro donde entra la luz, lo más hondo en el fondo derecho */}
        <linearGradient id="caliza" x1="0.05" y1="0.1" x2="1" y2="0.9">
          <stop offset="0%" stopColor="#f7f1e4" />
          <stop offset="38%" stopColor="#ece1cb" />
          <stop offset="100%" stopColor="#c9b99b" />
        </linearGradient>

        {/* fuste: cara izquierda iluminada, derecha en sombra. Da el volumen. */}
        <linearGradient id="fuste" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9b492" />
          <stop offset="20%" stopColor="#fdf8ec" />
          <stop offset="58%" stopColor="#ddcdac" />
          <stop offset="86%" stopColor="#a08c69" />
          <stop offset="100%" stopColor="#7d6b4d" />
        </linearGradient>

        <linearGradient id="nogal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#211609" />
          <stop offset="55%" stopColor="#3d2a18" />
          <stop offset="100%" stopColor="#57402a" />
        </linearGradient>

        <linearGradient id="travertino" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbbb9c" />
          <stop offset="30%" stopColor="#e4d8c0" />
          <stop offset="100%" stopColor="#f4ecdd" />
        </linearGradient>

        {/* el vano reflejado en el suelo: se apaga con la distancia */}
        <linearGradient id="reflejo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="reflejoColumna" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdf8ec" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fdf8ec" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="hueco" x1="0.1" y1="0" x2="0.9" y2="0.6">
          <stop offset="0%" stopColor="#a08c68" />
          <stop offset="100%" stopColor="#6f5e42" />
        </linearGradient>

        <linearGradient id="estatua" x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0%" stopColor="#fbf5e7" />
          <stop offset="38%" stopColor="#ddd0b4" />
          <stop offset="100%" stopColor="#8d7c60" />
        </linearGradient>

        <filter id="difusa" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>

        <filter id="reflejar" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        <filter id="sombraLarga" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="17" />
        </filter>

        <filter id="aire" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="44" />
        </filter>

        {/* sin grano, una superficie clara y grande delata que es CSS */}
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <clipPath id="exterior">
          <rect x="-1000" y={IMPOSTA} width="1620" height={HORIZONTE - IMPOSTA} />
        </clipPath>
      </defs>

      {/* ───── el exterior: cielo, mar, costa ───── */}
      <g clipPath="url(#exterior)">
        <rect x="-1000" y={IMPOSTA - 40} width="1620" height="400" fill="url(#cielo)" />
        <rect x="-1000" y="392" width="1620" height={HORIZONTE - 392} fill="url(#agua)" />
        {/* costa lejana, en dos planos: la bruma separa uno de otro */}
        <path d="M-1000 392 q120 -46 250 -26 q140 22 250 -8 q120 -32 240 2 v32 H-1000 Z" fill="#7b9498" opacity="0.72" />
        <path d="M-1000 396 q180 -26 330 -6 q160 20 300 -4 v14 H-1000 Z" fill="#66838a" opacity="0.6" />
        {/* brillo del sol sobre el agua, hacia la izquierda */}
        <ellipse cx="150" cy="452" rx="230" ry="46" fill="#fdf6e4" opacity="0.42" filter="url(#aire)" />
        {/* cipreses: los verticales oscuros que fijan el fondo */}
        <g fill="#2d3b26">
          <path d="M96 470 q-14 -96 14 -176 q28 80 14 176 Z" />
          <path d="M188 470 q-18 -122 18 -222 q36 100 18 222 Z" />
          <path d="M258 470 q-11 -80 11 -148 q22 68 11 148 Z" />
          <path d="M540 470 q-15 -104 15 -190 q30 86 15 190 Z" />
        </g>
        <g fill="#3f4f33" opacity="0.88">
          <ellipse cx="352" cy="452" rx="72" ry="34" />
          <ellipse cx="416" cy="462" rx="58" ry="26" />
        </g>
      </g>

      {/* ───── el muro del fondo ───── */}
      <rect x="620" y={IMPOSTA} width="2300" height={HORIZONTE - IMPOSTA} fill="url(#caliza)" />
      {/* despiece de sillares: horizontales muy tenues */}
      {/* el despiece se queda por debajo del título: una junta cruzando el texto se lee como un fallo */}
      <g stroke="#bda88a" strokeWidth="1.4" opacity="0.3">
        <path d="M620 438 H2920" />
        <path d="M620 486 H2920" />
      </g>

      {/* ───── hornacina y escultura ───── */}
      <g>
        <path d="M1568 520 V318 a112 112 0 0 1 224 0 V520 Z" fill="url(#hueco)" />
        {/* moldura de la hornacina */}
        <path
          d="M1556 520 V318 a124 124 0 0 1 248 0 V520"
          fill="none"
          stroke="#e6dbc0"
          strokeWidth="12"
        />
        <path
          d="M1568 520 V318 a112 112 0 0 1 224 0 V520"
          fill="none"
          stroke="#a4906e"
          strokeWidth="3"
          opacity="0.7"
        />

        <g filter="url(#difusa)">
          {/* plinto */}
          <rect x="1636" y="474" width="88" height="46" fill="#cdbb99" />
          <rect x="1626" y="462" width="108" height="14" rx="3" fill="#e0d3b4" />
          {/* la figura: hombros anchos, caída recta, un brazo recogido */}
          <g fill="url(#estatua)">
            <path d="M1650 462 q4 -132 22 -180 q14 -38 28 -42 q14 4 28 42 q18 48 22 180 Z" />
            {/* brazo cruzado sobre el pecho */}
            <path d="M1660 322 q28 22 62 12 q10 4 6 16 q-38 12 -70 -12 Z" />
            {/* cuello y cabeza */}
            <rect x="1691" y="266" width="18" height="30" />
            <ellipse cx="1700" cy="248" rx="24" ry="28" />
            <path d="M1676 244 q6 -34 24 -36 q18 2 24 36 q-11 -18 -24 -18 q-13 0 -24 18 Z" fill="#c3b090" />
          </g>
          {/* pliegues del himatión */}
          <g stroke="#a08d6d" strokeWidth="2.6" fill="none" opacity="0.7">
            <path d="M1668 350 q-10 62 -12 110" />
            <path d="M1690 344 q-3 66 -2 116" />
            <path d="M1712 348 q9 62 11 112" />
            <path d="M1732 358 q12 54 14 102" />
          </g>
          {/* la luz de la izquierda le da en el hombro y la mejilla */}
          <path d="M1650 462 q4 -132 22 -180 q6 -16 12 -26 q-6 100 -8 206 Z" fill="#fffaee" opacity="0.36" />
          <ellipse cx="1688" cy="244" rx="10" ry="15" fill="#fffaee" opacity="0.34" />
        </g>
      </g>

      {/* ───── el suelo ───── */}
      <rect x="-1000" y={HORIZONTE} width="3920" height="960" fill="url(#travertino)" />
      <rect x="-1000" y={HORIZONTE - 4} width="3920" height="6" fill="#b3a082" opacity="0.55" />

      {/* juntas del despiece, en fuga */}
      <g stroke="#c3b090" strokeWidth="1.5" opacity="0.4">
        {[-1500, -820, -180, 380, 900, 1460, 2080, 2760, 3480].map((x, i) => (
          <path key={x} d={`M${x} 1480 L${FUGA.x + (i - 4) * 46} ${FUGA.y + 2}`} />
        ))}
      </g>
      <g stroke="#c3b090" strokeWidth="1.5" opacity="0.26">
        {[566, 632, 726, 862, 1060].map((y) => (
          <path key={y} d={`M-1000 ${y} H2920`} />
        ))}
      </g>

      {/* el vano de la izquierda, devuelto por el travertino pulido */}
      <rect x="-1000" y={HORIZONTE} width="1620" height="230" fill="url(#reflejo)" filter="url(#reflejar)" />

      {/* ───── la columnata ───── */}
      {[
        { x: 178, w: 68 },
        { x: 452, w: 64 },
        { x: 640, w: 60 },
        { x: 1498, w: 58 },
      ].map(({ x, w }) => (
        <g key={x}>
          {/* sombra arrojada hacia la derecha, hacia la fuga */}
          <path
            d={`M${x - w / 2} ${HORIZONTE} L${x + w / 2} ${HORIZONTE} L${x + w * 5.2} 1080 L${x + w * 3.4} 1080 Z`}
            fill="#8d7b5c"
            opacity="0.2"
            filter="url(#sombraLarga)"
          />
          {/* reflejo del fuste */}
          <rect
            x={x - w / 2}
            y={HORIZONTE}
            width={w}
            height="180"
            fill="url(#reflejoColumna)"
            filter="url(#reflejar)"
          />
          {/* fuste con éntasis: se estrecha hacia arriba y abomba en el tercio bajo */}
          <path
            d={`M${x - w / 2} ${HORIZONTE} C${x - w / 2 - 3} 420 ${x - w / 2 + 5} 300 ${x - w * 0.42} ${IMPOSTA + 26}
                L${x + w * 0.42} ${IMPOSTA + 26} C${x + w / 2 - 5} 300 ${x + w / 2 + 3} 420 ${x + w / 2} ${HORIZONTE} Z`}
            fill="url(#fuste)"
          />
          {/* capitel toscano */}
          <rect x={x - w * 0.52} y={IMPOSTA + 12} width={w * 1.04} height="16" rx="3" fill="#efe4cc" />
          <rect x={x - w * 0.6} y={IMPOSTA} width={w * 1.2} height="14" rx="2" fill="#f6eeda" />
          {/* basa */}
          <rect x={x - w * 0.58} y={HORIZONTE - 16} width={w * 1.16} height="16" rx="2" fill="#e3d5b8" />
          <rect x={x - w * 0.64} y={HORIZONTE - 5} width={w * 1.28} height="7" rx="2" fill="#d3c3a3" />
        </g>
      ))}

      {/* ───── arquitrabe ───── */}
      <rect x="-1000" y="150" width="3920" height="30" fill="#f2e9d4" />
      <rect x="-1000" y="180" width="3920" height="7" fill="#cdbc9c" opacity="0.8" />
      <rect x="-1000" y="140" width="3920" height="12" fill="#fbf5e6" />

      {/* ───── artesonado de nogal: el ancla oscura de la sala ───── */}
      <g>
        <rect x="-1000" y="-320" width="3920" height="466" fill="url(#nogal)" />

        {/*
          Vigas paralelas al plano del cuadro, no en fuga. En una franja de
          apenas 145 unidades de alto, unas vigas convergiendo hacia el punto
          de fuga se leen como arañazos diagonales: la perspectiva es correcta
          y el resultado, ilegible. Separadas cada vez menos hacia el fondo
          dicen «techo de madera» sin ninguna duda, y la profundidad la ponen
          el suelo y las sombras.
        */}
        {[
          [-168, 30],
          [-58, 25],
          [20, 20],
          [76, 16],
          [112, 13],
        ].map(([y, alto]) => (
          <g key={y}>
            <rect x="-1000" y={y} width="3920" height={alto} fill="#180f05" />
            <rect x="-1000" y={y + alto} width="3920" height="3" fill="#9a7750" opacity="0.55" />
            <rect x="-1000" y={y} width="3920" height="2" fill="#0d0802" opacity="0.7" />
          </g>
        ))}

        {/* casetones: solo en la cuadrícula más cercana, donde se ven de verdad */}
        <g fill="#180f05" opacity="0.85">
          {[-720, -480, -240, 0, 240, 480, 720, 960].map((d) => (
            <rect key={d} x={960 + d - 6} y="-33" width="12" height="53" />
          ))}
        </g>

        {/* el vuelo de la cornisa, lo más oscuro de la sala */}
        <rect x="-1000" y="128" width="3920" height="17" fill="#100a02" />
        <rect x="-1000" y="126" width="3920" height="3" fill="#a07c4f" opacity="0.5" />
      </g>

      {/* ───── la luz: entra por la columnata y cruza la sala ───── */}
      <polygon
        points={`0,${HORIZONTE} 620,${HORIZONTE} 1500,1080 -200,1080`}
        fill="#fffdf6"
        opacity="0.46"
        filter="url(#aire)"
      />
      <ellipse cx="255" cy="655" rx="380" ry="205" fill="#fff8e8" opacity="0.24" filter="url(#aire)" />

      {/* ───── olivos en maceta, contra el muro ───── */}
      {[
        { x: 596, e: 0.78 },
        { x: 1452, e: 0.72 },
      ].map(({ x, e }) => (
        <g key={x} transform={`translate(${x} ${HORIZONTE}) scale(${e})`}>
          <ellipse cx="6" cy="4" rx="62" ry="12" fill="#a8916f" opacity="0.34" filter="url(#difusa)" />
          <path d="M-34 0 h68 l-9 -66 h-50 Z" fill="#d8c8a6" />
          <path d="M-34 0 h20 l-6 -66 h-14 Z" fill="#eee2c6" />
          <rect x="-40" y="-80" width="80" height="16" rx="3" fill="#e6d9ba" />
          <rect x="-4" y="-172" width="8" height="94" fill="#7c5f3c" />
          <g>
            <ellipse cx="-28" cy="-182" rx="38" ry="26" fill="#5f6e4d" />
            <ellipse cx="26" cy="-192" rx="40" ry="28" fill="#556347" />
            <ellipse cx="-2" cy="-228" rx="46" ry="31" fill="#6b7a5a" />
            <ellipse cx="-40" cy="-214" rx="25" ry="18" fill="#556347" />
            <ellipse cx="36" cy="-220" rx="24" ry="17" fill="#5f6e4d" />
            <ellipse cx="-14" cy="-246" rx="22" ry="15" fill="#75846a" />
          </g>
        </g>
      ))}

      <rect
        x="-1000"
        y="-400"
        width="3920"
        height="1880"
        filter="url(#grano)"
        opacity="0.055"
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}
