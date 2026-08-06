/**
 * La villa.
 *
 * Todo dibujado en SVG: cero imágenes, cero fuentes externas, cero KB de red.
 * La alternativa (fotografías de escultura clásica) traía licencias que revisar,
 * varios MB por pantalla y, sobre todo, un realismo que empuja la sala hacia el
 * videojuego. Aquí las esculturas son sombra y volumen: atmósfera, no ilustración.
 *
 * Nada de esto es interactivo ni accesible al lector de pantalla — es el muro.
 */
export function Escenografia() {
  return (
    <svg
      className="escenografia"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="muro" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#241c15" />
          <stop offset="55%" stopColor="#171209" />
          <stop offset="100%" stopColor="#0d0a07" />
        </linearGradient>

        <radialGradient id="lampara" cx="0.3" cy="0.02" r="0.85">
          <stop offset="0%" stopColor="#e6ab63" stopOpacity="0.3" />
          <stop offset="45%" stopColor="#c06a44" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#c06a44" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="piedra" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#4a3a2b" />
          <stop offset="48%" stopColor="#332619" />
          <stop offset="100%" stopColor="#1d1610" />
        </linearGradient>

        <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2017" />
          <stop offset="100%" stopColor="#0c0906" />
        </linearGradient>

        {/*
          El interior de la hornacina no puede ser un gris oscuro: rodeado de
          ámbar, el ojo lo lee azulado (contraste simultáneo) y aparece una
          mancha fría en una sala que debe ser cálida entera. Se mantiene
          oscuro pero con temperatura.
        */}
        <linearGradient id="hueco" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#150e08" />
          <stop offset="100%" stopColor="#22170c" />
        </linearGradient>

        <filter id="difuso" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>

        <filter id="muyDifuso" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="26" />
        </filter>

        <radialGradient id="vineta" cx="0.5" cy="0.42" r="0.78">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
      </defs>

      {/* muro y suelo */}
      <rect width="1920" height="1080" fill="url(#muro)" />
      <rect y="798" width="1920" height="282" fill="url(#suelo)" />
      <rect y="796" width="1920" height="2" fill="#e6ab63" opacity="0.07" />

      {/* la luz cálida que entra por la izquierda — lo único que se mueve */}
      <g className="respiracion">
        <ellipse cx="560" cy="60" rx="1080" ry="760" fill="url(#lampara)" />
        <polygon
          points="120,0 640,0 1080,900 300,900"
          fill="#e6ab63"
          opacity="0.045"
          filter="url(#muyDifuso)"
        />
      </g>

      {/* columnas del fondo */}
      {[640, 1280].map((x) => (
        <g key={x} opacity="0.5" filter="url(#difuso)">
          <rect x={x - 34} y="150" width="68" height="648" fill="url(#piedra)" />
          {[-20, -6, 8, 22].map((d) => (
            <rect key={d} x={x + d} y="150" width="3" height="648" fill="#0d0a07" opacity="0.5" />
          ))}
          {/* capitel */}
          <rect x={x - 48} y="128" width="96" height="26" rx="4" fill="#40311f" />
          <rect x={x - 42} y="118" width="84" height="12" rx="3" fill="#4a3a2b" />
          {/* basa */}
          <rect x={x - 46} y="774" width="92" height="24" rx="4" fill="#3a2c1d" />
        </g>
      ))}

      {/* hornacina izquierda — busto */}
      <g opacity="0.78" filter="url(#difuso)">
        <path d="M46 798 V368 a112 112 0 0 1 224 0 V798 Z" fill="url(#hueco)" />
        <path
          d="M46 798 V368 a112 112 0 0 1 224 0 V798"
          fill="none"
          stroke="#5a4630"
          strokeWidth="3"
          opacity="0.55"
        />
        <g fill="url(#piedra)">
          {/* plinto */}
          <rect x="112" y="700" width="92" height="98" />
          <rect x="100" y="690" width="116" height="16" rx="3" />
          {/* hombros y pecho */}
          <path d="M108 690 q6 -92 50 -108 q44 16 50 108 Z" />
          {/* cuello */}
          <rect x="146" y="548" width="24" height="46" />
          {/* cabeza y cabello recogido */}
          <ellipse cx="158" cy="516" rx="38" ry="46" />
          <path d="M120 508 q10 -52 38 -54 q28 2 38 54 q-16 -26 -38 -26 q-22 0 -38 26 Z" fill="#3d2f20" />
        </g>
        {/* la luz le da en la mejilla izquierda */}
        <ellipse cx="144" cy="512" rx="14" ry="20" fill="#e6ab63" opacity="0.1" />
      </g>

      {/* hornacina derecha — figura con túnica */}
      <g opacity="0.5" filter="url(#difuso)">
        <path d="M1650 798 V330 a112 112 0 0 1 224 0 V798 Z" fill="url(#hueco)" />
        <path
          d="M1650 798 V330 a112 112 0 0 1 224 0 V798"
          fill="none"
          stroke="#5a4630"
          strokeWidth="3"
          opacity="0.55"
        />
        <g fill="url(#piedra)">
          {/* basa */}
          <rect x="1706" y="742" width="112" height="56" />
          <rect x="1694" y="730" width="136" height="16" rx="3" />
          {/*
            Túnica con hombros anchos y caída recta. La versión anterior salía
            del cuello directamente a un cono: leía como un bolo, no como una
            figura vestida. Lo que da la lectura humana es el ancho de hombros
            frente al de la caída, no el detalle.
          */}
          <path d="M1721 494 q-19 68 -27 236 h134 q-8 -168 -27 -236 q-40 -19 -80 0 Z" />
          {/* pliegues */}
          <path d="M1732 520 q-14 106 -16 208" stroke="#0d0a07" strokeWidth="3" fill="none" opacity="0.4" />
          <path d="M1762 516 q3 110 4 212" stroke="#0d0a07" strokeWidth="3" fill="none" opacity="0.4" />
          <path d="M1792 520 q14 106 16 208" stroke="#0d0a07" strokeWidth="3" fill="none" opacity="0.4" />
          {/* cuello y cabeza */}
          <rect x="1752" y="432" width="20" height="46" />
          <ellipse cx="1762" cy="410" rx="27" ry="33" />
          <path d="M1735 404 q7 -38 27 -40 q20 2 27 40 q-12 -20 -27 -20 q-15 0 -27 20 Z" fill="#3d2f20" />
        </g>
        <ellipse cx="1751" cy="408" rx="11" ry="16" fill="#e6ab63" opacity="0.08" />
      </g>

      {/* viñeta: cierra la sala y empuja la vista al centro */}
      <rect width="1920" height="1080" fill="url(#vineta)" />
    </svg>
  );
}
