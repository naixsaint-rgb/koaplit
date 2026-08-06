#!/usr/bin/env node
/**
 * La comprobación del Consejo.
 *
 * No verifica que el código funcione: verifica que las decisiones registradas
 * se sostengan como decisiones deliberadas. Falla el proceso si alguna no lo hace.
 *
 *   npm run verificar
 */
import { DECISIONES } from '../src/datos/index.js';
import { auditar, ETIQUETA_ESTADO } from '../src/dominio/decision.js';

let caidas = 0;

for (const d of DECISIONES) {
  const fallos = auditar(d);
  const voces = new Set((d.posiciones ?? []).map((p) => p.miembro)).size;

  if (fallos.length === 0) {
    console.log(
      `✓ ${d.id}  ${ETIQUETA_ESTADO[d.estado]} · ${voces} voces · ` +
        `${d.alternativasDescartadas.length} alternativas descartadas · ` +
        `${d.revisarSi.length} condiciones de revisión`,
    );
  } else {
    caidas++;
    console.error(`✗ ${d.id}  ${d.titulo}`);
    for (const f of fallos) console.error(`    · ${f}`);
  }
}

if (caidas > 0) {
  console.error(`\n${caidas} decisión(es) no se sostienen. El Consejo no ha deliberado todavía.`);
  process.exit(1);
}

console.log(`\n${DECISIONES.length} decisiones se sostienen.`);
