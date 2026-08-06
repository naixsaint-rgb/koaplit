import { ETIQUETA_POSTURA } from '../dominio/decision.js';
import { miembro as buscarMiembro } from '../dominio/consejo.js';

/**
 * El panel de lectura. Geometría fija: ocupa siempre el mismo alto y el mismo
 * sitio, elija el Consejo la silla que elija. Nada se desplaza al cambiar de
 * voz — solo cambia el texto. Eso es "movimiento mínimo" aplicado al layout,
 * no solo a las animaciones.
 */
export function Voz({ decision, elegido }) {
  if (!elegido) {
    const decidio = buscarMiembro(decision.resolucion.decididaPor);
    return (
      <section className="voz" aria-live="polite">
        <div className="quien">
          <h2>La resolución</h2>
          <p className="rol">{decision.id}</p>
          <p className="obligacion">
            Decidida por {decidio?.nombre ?? decision.resolucion.decididaPor} el{' '}
            {decision.resolucion.fecha}, después de escuchar al Consejo.
          </p>
        </div>
        <div className="argumento">
          <p className="resolucion">{decision.resolucion.texto}</p>
          {/*
            Las consecuencias van aquí y no en una pantalla aparte: una
            resolución sin sus consecuencias a la vista es una frase bonita.
            Leerlas juntas es lo que convierte la sala en un sitio donde se
            decide y no donde se anuncia.
          */}
          <span className="etiqueta">Consecuencias</span>
          <ul className="consecuencias">
            {decision.consecuencias.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const m = buscarMiembro(elegido);
  const posicion = (decision.posiciones ?? []).find((p) => p.miembro === elegido);

  return (
    <section className="voz" aria-live="polite">
      <div className="quien">
        <h2>{m.nombre}</h2>
        <p className="rol">{m.rol}</p>
        <p className="obligacion">{m.obligacion}</p>
      </div>

      <div className="argumento">
        {posicion ? (
          <>
            <span className="etiqueta">
              {ETIQUETA_POSTURA[posicion.postura]} · {decision.id}
            </span>
            <p>{posicion.argumento}</p>
          </>
        ) : (
          <>
            <span className="etiqueta">Sin pronunciarse · {decision.id}</span>
            <p className="silencio">
              {m.presente
                ? `${m.nombre} no se pronunció sobre esta decisión. El silencio queda registrado como ausencia, no como acuerdo.`
                : `${m.nombre} todavía no se ha incorporado al Consejo. Su silla se deja puesta desde el primer día: un hueco visible es una pregunta abierta.`}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
