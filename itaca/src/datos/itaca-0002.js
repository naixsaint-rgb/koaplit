import { ESTADOS, POSTURAS } from '../dominio/decision.js';

/**
 * ÍTACA-0002 — Alcance del Sprint 1.
 *
 * Esta deliberación sí es de primera mano: ocurrió entre Hermes y Odiseo el
 * 2026-08-06, en la incorporación de Hermes. Atenea, Mnemósine y Sócrates no
 * estaban presentes, y por eso no aparecen: el silencio no es abstención.
 */
export const ITACA_0002 = {
  id: 'ÍTACA-0002',
  titulo: 'La Sala del Consejo se construye alrededor de una decisión real',
  pregunta:
    '¿Debe el Sprint 1 construir la sala como espacio puro, sin funcionalidad, o debe la sala nacer ya renderizando una decisión deliberada?',
  estado: ESTADOS.RESUELTA,
  planteadaPor: 'hermes',
  fecha: '2026-08-06',

  contexto:
    'El Sprint 1 se enunció como "construir la Sala del Consejo: sin funcionalidades, ' +
    'sin backend, sin IA. Solo un espacio donde el Consejo quiera reunirse todos los ' +
    'días", con requisitos estrictos de ergonomía y estética (sin scroll, Full HD, modo ' +
    'oscuro, tipografía grande, mesa central, luz cálida, movimiento mínimo). ' +
    'ÍTACA-0001 acababa de fijar que toda la arquitectura debe girar alrededor del ' +
    'ciclo de vida de una decisión.',

  posiciones: [
    {
      miembro: 'hermes',
      postura: POSTURAS.PROPONE,
      argumento:
        'Un sprint puramente escenográfico contradice a ÍTACA-0001 en la práctica ' +
        'aunque la respete en el discurso. Si la sala se diseña vacía, sus proporciones, ' +
        'su densidad y su retícula quedan fijadas antes de saber qué contiene una ' +
        'decisión; cuando llegue el contenido real, la sala pasará a ser una restricción ' +
        'sobre la arquitectura en lugar de una consecuencia de ella, y rehacerla costará ' +
        'más que hacerla bien ahora. El coste de evitarlo es casi nulo: la misma sala, ' +
        'los mismos requisitos visuales, sin backend y sin IA, pero mostrando un objeto ' +
        'Decisión real con su ciclo de vida y las sillas del Consejo alrededor. ' +
        'A cambio, el Sprint 1 valida el modelo en vez de aplazarlo.',
    },
    {
      miembro: 'odiseo',
      postura: POSTURAS.A_FAVOR,
      argumento:
        'El Consejo aprueba el criterio de Hermes. La Sala del Consejo nacerá ya ' +
        'alrededor de la primera decisión deliberada. No construiremos una escenografía; ' +
        'construiremos el primer lugar donde una decisión pueda existir.',
    },
  ],

  alternativasDescartadas: [
    {
      opcion: 'Sala pura, tal como se enunció el sprint',
      porQue:
        'Congela la forma antes que el fondo y aplaza la validación de ÍTACA-0001 ' +
        'a un sprint en el que ya será caro corregir.',
    },
    {
      opcion: 'Modelo primero, sala en el Sprint 2',
      porQue:
        'Más correcto en ingeniería pura, pero rompe el objetivo declarado del sprint: ' +
        'que el Consejo tenga cuanto antes un sitio donde querer reunirse. Un modelo sin ' +
        'lugar no crea el hábito, y el hábito era el punto.',
    },
  ],

  resolucion: {
    texto:
      'El Sprint 1 construye la Sala del Consejo con todos sus requisitos de ergonomía ' +
      'y estética, sin backend y sin IA, renderizando ÍTACA-0001 como objeto real sobre ' +
      'la mesa. El modelo de dominio se escribe primero y la sala se deriva de él.',
    decididaPor: 'odiseo',
    fecha: '2026-08-06',
  },

  consecuencias: [
    'src/dominio/ no puede importar nada de src/sala/. La dependencia es en un solo sentido.',
    'La sala no inventa campos: solo muestra lo que el modelo de decisión define.',
    'Las actas de docs/decisiones/ se generan desde los datos, no se escriben a mano.',
  ],

  revisarSi: [
    'Renderizar una decisión real impide cumplir alguno de los requisitos de la sala (sin scroll, tipografía grande, ergonomía).',
    'El modelo de decisión cambia tanto en el Sprint 2 que la sala hay que rehacerla igualmente.',
  ],
};
