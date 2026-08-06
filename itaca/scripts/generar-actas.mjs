#!/usr/bin/env node
/**
 * MNEMÓSINE.
 *
 * Las actas de docs/decisiones/ se generan desde src/datos/. Nunca al revés,
 * y nunca las dos a mano: dos copias editables de una misma decisión son, antes
 * o después, dos decisiones distintas — y entonces la memoria del Consejo ya no
 * es memoria, es un segundo relato.
 *
 *   npm run actas
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DECISIONES } from '../src/datos/index.js';
import { auditar, ETIQUETA_ESTADO, ETIQUETA_POSTURA } from '../src/dominio/decision.js';
import { miembro } from '../src/dominio/consejo.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, 'docs', 'decisiones');

const nombre = (id) => miembro(id)?.nombre ?? id;

const ficheroDe = (d) =>
  d.id
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-') + '.md';

function acta(d) {
  const l = [];
  l.push(`# ${d.id} · ${d.titulo}`, '');
  l.push(`> Generado desde \`src/datos/\`. No editar a mano: los cambios se pierden.`, '');
  l.push(`**Estado:** ${ETIQUETA_ESTADO[d.estado]}  `);
  l.push(`**Planteada por:** ${nombre(d.planteadaPor)}  `);
  l.push(`**Fecha:** ${d.fecha}`, '');
  l.push('## Pregunta', '', d.pregunta, '');
  l.push('## Contexto', '', d.contexto, '');

  l.push('## Deliberación', '');
  for (const p of d.posiciones ?? []) {
    l.push(`### ${nombre(p.miembro)} — ${ETIQUETA_POSTURA[p.postura]}`, '', p.argumento, '');
  }

  l.push('## Alternativas descartadas', '');
  for (const a of d.alternativasDescartadas ?? []) {
    l.push(`- **${a.opcion}** — ${a.porQue}`);
  }
  l.push('');

  l.push('## Resolución', '');
  l.push(`${d.resolucion.texto}`, '');
  l.push(`— ${nombre(d.resolucion.decididaPor)}, ${d.resolucion.fecha}`, '');

  l.push('## Consecuencias', '');
  for (const c of d.consecuencias ?? []) l.push(`- ${c}`);
  l.push('');

  l.push('## Qué nos haría cambiar de opinión', '');
  for (const r of d.revisarSi ?? []) l.push(`- ${r}`);
  l.push('');

  const fallos = auditar(d);
  l.push('---', '');
  l.push(
    fallos.length === 0
      ? '_Esta decisión se sostiene: fue deliberada, se descartaron alternativas y consta qué la reabriría._'
      : `_Esta decisión NO se sostiene:_\n${fallos.map((f) => `- ${f}`).join('\n')}`,
  );
  l.push('');

  return l.join('\n');
}

await mkdir(DESTINO, { recursive: true });

const indice = ['# Memoria del Consejo', '', 'Actas generadas. La fuente es `src/datos/`.', ''];

for (const d of DECISIONES) {
  const fichero = ficheroDe(d);
  await writeFile(join(DESTINO, fichero), acta(d), 'utf8');
  indice.push(`- [${d.id} · ${d.titulo}](./${fichero}) — ${ETIQUETA_ESTADO[d.estado]}`);
  console.log(`escrita  docs/decisiones/${fichero}`);
}

indice.push('');
await writeFile(join(DESTINO, 'README.md'), indice.join('\n'), 'utf8');
console.log('escrita  docs/decisiones/README.md');
