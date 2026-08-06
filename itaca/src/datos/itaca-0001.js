import { ESTADOS, POSTURAS } from '../dominio/decision.js';

/**
 * ÍTACA-0001 — La decisión fundacional.
 *
 * Aviso de Mnemósine: las posiciones de Atenea y Mnemósine están
 * reconstruidas a partir del documento de incorporación, no transcritas de
 * la deliberación original. Quedan pendientes de ratificación por Odiseo.
 * Se registran así, y no como texto anónimo, porque una memoria que no
 * distingue lo transcrito de lo reconstruido no es memoria: es rumor.
 */
export const ITACA_0001 = {
  id: 'ÍTACA-0001',
  titulo: 'La unidad fundamental de ÍTACA es la decisión deliberada',
  pregunta: '¿Alrededor de qué objeto debe girar toda la arquitectura de ÍTACA?',
  estado: ESTADOS.RESUELTA,
  planteadaPor: 'odiseo',
  fecha: '2026-08-06',

  contexto:
    'ÍTACA no es un chat, ni un dashboard, ni una herramienta de productividad. ' +
    'Es un sistema para mejorar la calidad de las decisiones, de forma que humanos ' +
    'e inteligencias artificiales piensen mejor juntos. Antes de escribir una línea ' +
    'de arquitectura hay que fijar cuál es la unidad que el sistema manipula, porque ' +
    'esa elección determina el modelo de datos, la interfaz y el límite de lo que ' +
    'ÍTACA podrá llegar a ser.',

  posiciones: [
    {
      miembro: 'odiseo',
      postura: POSTURAS.PROPONE,
      argumento:
        'Las herramientas existentes optimizan el flujo: mensajes que se acumulan, ' +
        'tareas que se cierran, proyectos que avanzan. Ninguna optimiza el juicio. ' +
        'Si queremos un sistema que mejore la calidad de las decisiones, la decisión ' +
        'tiene que ser el objeto, no el subproducto.',
    },
    {
      miembro: 'atenea',
      postura: POSTURAS.A_FAVOR,
      argumento:
        'Es la única de las opciones que tiene ciclo de vida propio y verificable. ' +
        'Un mensaje solo tiene autor y hora. Una conversación no tiene final. Una tarea ' +
        'tiene estado pero no tiene razones. Una decisión tiene contexto, alternativas, ' +
        'argumentos, resolución y consecuencias: se puede auditar años después. ' +
        'Elegir la decisión nos obliga a guardar el porqué, y el porqué es lo primero ' +
        'que pierden todos los sistemas que hemos usado.',
    },
    {
      miembro: 'hermes',
      postura: POSTURAS.A_FAVOR_CON_RESERVAS,
      argumento:
        'Estoy de acuerdo con el fondo y firmo la decisión. Mi reserva es de método: ' +
        'tal como está enunciada no es falsable. "Todo debe girar alrededor del ciclo ' +
        'de vida de una decisión" no se puede contradecir con nada porque todavía no ' +
        'existe ese ciclo de vida escrito en ninguna parte. El riesgo real no es que ' +
        'la decisión sea equivocada: es que se convierta en un lema que citamos y no ' +
        'en una restricción que nos frena. Propongo que la primera cosa que construyamos ' +
        'no sea una sala vacía sino el ciclo de vida en código, con invariantes que ' +
        'fallen cuando el Consejo no ha deliberado de verdad. Si esas invariantes nos ' +
        'estorban alguna vez, sabremos que la decisión estaba viva.',
    },
    {
      miembro: 'mnemosine',
      postura: POSTURAS.A_FAVOR,
      argumento:
        'Es la única unidad que merece ser recordada por sí misma. Nadie necesita ' +
        'recuperar el mensaje número cuatrocientos de un hilo; todo el mundo necesita, ' +
        'tarde o temprano, recuperar por qué se decidió lo que se decidió. Si la unidad ' +
        'es la decisión, la memoria del Consejo deja de ser un archivo y pasa a ser ' +
        'una estructura.',
    },
  ],

  alternativasDescartadas: [
    {
      opcion: 'El mensaje',
      porQue:
        'Es la unidad del chat. Optimiza volumen y latencia, no juicio. Convierte el ' +
        'sistema en un lugar donde se habla, no donde se decide.',
    },
    {
      opcion: 'La conversación',
      porQue:
        'No tiene cierre ni resolución. Una conversación puede ser excelente y no ' +
        'producir nada; el sistema no sabría distinguirlo.',
    },
    {
      opcion: 'La tarea',
      porQue:
        'Es la unidad de la productividad. Registra qué se hizo pero borra por qué se ' +
        'eligió hacerlo. Es exactamente el olvido que ÍTACA existe para evitar.',
    },
    {
      opcion: 'El proyecto',
      porQue:
        'Demasiado grueso. Un proyecto contiene cientos de decisiones y no permite ' +
        'razonar sobre ninguna en concreto.',
    },
  ],

  resolucion: {
    texto:
      'La unidad fundamental de ÍTACA es la decisión deliberada. Toda la arquitectura ' +
      'futura debe girar alrededor de su ciclo de vida. Se acepta la reserva de Hermes: ' +
      'el ciclo de vida se escribe en código con invariantes desde el primer sprint.',
    decididaPor: 'odiseo',
    fecha: '2026-08-06',
  },

  consecuencias: [
    'El modelo de dominio se escribe antes que cualquier interfaz.',
    'La Sala del Consejo se construye alrededor de una decisión real, no como escenografía.',
    'Toda funcionalidad futura debe justificarse como parte del ciclo de vida de una decisión.',
    'La memoria del Consejo se estructura por decisión, no por fecha ni por conversación.',
  ],

  revisarSi: [
    'Aparece un tipo de trabajo valioso del Consejo que no encaja como decisión y que forzarlo empobrece.',
    'El coste de registrar una decisión completa hace que el Consejo deje de registrarlas.',
    'Las invariantes de deliberación resultan siempre triviales de satisfacer: significaría que no restringen nada.',
  ],
};
