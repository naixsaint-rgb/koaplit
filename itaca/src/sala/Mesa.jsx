import { CICLO, ETIQUETA_ESTADO } from '../dominio/decision.js';

/**
 * La mesa central. Encima de la mesa está la decisión — literalmente el objeto
 * alrededor del cual se sienta el Consejo. Si algún día la mesa muestra otra
 * cosa que no sea una decisión, ÍTACA-0001 se ha roto.
 */
export function Mesa({ decision }) {
  const actual = CICLO.indexOf(decision.estado);

  return (
    <article className="mesa" aria-labelledby="titulo-decision">
      <p className="estado">{ETIQUETA_ESTADO[decision.estado]}</p>

      <h1 className="titulo" id="titulo-decision">
        {decision.titulo}
      </h1>

      <p className="pregunta">{decision.pregunta}</p>

      <ol className="ciclo" aria-label="Ciclo de vida de la decisión">
        {CICLO.map((estado, i) => (
          <li
            key={estado}
            data-alcanzado={i <= actual ? 'si' : 'no'}
            data-actual={i === actual ? 'si' : 'no'}
            aria-current={i === actual ? 'step' : undefined}
          >
            {ETIQUETA_ESTADO[estado]}
          </li>
        ))}
      </ol>
    </article>
  );
}
