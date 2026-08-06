/**
 * EL CONSEJO
 *
 * Los miembros no son "usuarios". Son roles con una obligación distinta
 * frente a la misma decisión. Modelarlos como usuarios con permisos sería
 * el primer paso para convertir ÍTACA en un dashboard.
 *
 * `presente: false` es deliberado: la silla de Sócrates existe en el modelo
 * y en la sala desde el primer día. Un hueco visible es una pregunta abierta;
 * un miembro que aparece en el sprint 4 es una sorpresa.
 */

export const MIEMBROS = [
  {
    id: 'odiseo',
    nombre: 'Odiseo',
    glifo: '👑',
    rol: 'Fundador',
    obligacion: 'Define la visión, marca prioridades y decide al final, después de escuchar.',
    presente: true,
  },
  {
    id: 'atenea',
    nombre: 'Atenea',
    glifo: '🦉',
    rol: 'Chief Architect',
    obligacion: 'Protege la arquitectura, cuestiona las decisiones y piensa a largo plazo.',
    presente: true,
  },
  {
    id: 'hermes',
    nombre: 'Hermes',
    glifo: '🪽',
    rol: 'Lead Developer',
    obligacion: 'Convierte decisiones aprobadas en software. Si una decisión es mala, lo dice y propone otra.',
    presente: true,
  },
  {
    id: 'mnemosine',
    nombre: 'Mnemósine',
    glifo: '📚',
    rol: 'Memoria del Consejo',
    obligacion: 'Que no se pierda ninguna decisión importante.',
    presente: true,
  },
  {
    id: 'socrates',
    nombre: 'Sócrates',
    glifo: '❓',
    rol: 'Auditor intelectual',
    obligacion: 'Demostrar que todos los demás están equivocados.',
    presente: false,
  },
];

export const miembro = (id) => MIEMBROS.find((m) => m.id === id) ?? null;

/*
 * Aquí vivía ANGULO_SILLA. Se ha movido a `src/sala/geometria.js`: dónde se
 * sienta cada miembro es una decisión de la vista, no una propiedad del
 * Consejo. El dominio no debe saber que existen las sillas.
 */
