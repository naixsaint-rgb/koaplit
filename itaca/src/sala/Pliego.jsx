import { ETIQUETA_POSTURA } from '../dominio/decision.js';
import { PLIEGO } from './geometria.js';
import { miembro as buscarMiembro } from '../dominio/consejo.js';

/**
 * EL PLIEGO: el documento vivo de la decisión, apoyado sobre el mármol.
 *
 * Esta es la corrección que el Consejo hizo a mi propuesta, y era mejor que la
 * propuesta: si la decisión se va entera al muro, la mesa se queda vacía y pasa
 * a ser mobiliario. Al muro sube solo el título —la identidad de la decisión—.
 * Aquí, sobre la mesa, se queda el trabajo: la pregunta, que no se mueve
 * mientras dure la deliberación, y debajo lo que sostiene quien tenga la
 * palabra.
 *
 * La pregunta permanece siempre a la vista, incluso mientras se lee a un
 * miembro. Un argumento que se lee sin la pregunta delante deja de ser un
 * argumento y pasa a ser una opinión.
 *
 * La inclinación es real (`rotateX` con fuga), no un sesgo decorativo: los
 * cuatro cantos caen dentro de la elipse de la mesa, y por eso el papel parece
 * apoyado en algo. Es moderada a propósito — con más grado el papel convence
 * más y se lee peor, y la ergonomía manda.
 */
export function Pliego({ decision, elegido }) {
  const m = elegido ? buscarMiembro(elegido) : null;
  const posicion = elegido ? (decision.posiciones ?? []).find((p) => p.miembro === elegido) : null;

  /*
   * Las medidas del pliego viven en `geometria.js` y llegan aquí como variables
   * CSS. Copiarlas al hoja de estilos las habría dejado en dos sitios, y el día
   * que se cambie una la otra se queda vieja: el papel dejaría de caber en la
   * mesa sin que nadie lo note.
   */
  const medidas = {
    '--pliego-x': PLIEGO.x,
    '--pliego-y': PLIEGO.y,
    '--pliego-ancho': PLIEGO.ancho,
    '--pliego-alto': PLIEGO.alto,
    '--pliego-inclinacion': `${PLIEGO.inclinacion}deg`,
    '--pliego-fuga': PLIEGO.fuga,
  };

  return (
    <div className="capa pliego-escena" style={medidas}>
      <article className="pliego" aria-live="polite">
        <p className="pregunta">{decision.pregunta}</p>

        <div className="lectura">
          {!elegido && (
            <>
              <p className="atribucion">
                Resolución<span>{decision.resolucion.fecha}</span>
              </p>
              <p className="cuerpo">{decision.resolucion.texto}</p>
              <ul className="consecuencias">
                {decision.consecuencias.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </>
          )}

          {elegido && posicion && (
            <>
              <p className="atribucion">
                {m.nombre}
                <span>{ETIQUETA_POSTURA[posicion.postura]}</span>
              </p>
              <p className="cuerpo">{posicion.argumento}</p>
            </>
          )}

          {elegido && !posicion && (
            <>
              <p className="atribucion">
                {m.nombre}
                <span>{m.presente ? 'Sin pronunciarse' : 'Sin incorporar'}</span>
              </p>
              <p className="cuerpo silencio">
                {m.presente
                  ? `${m.nombre} no se pronunció sobre esta decisión. El silencio queda registrado como ausencia, no como acuerdo.`
                  : `${m.nombre} todavía no se ha incorporado al Consejo. Su silla se deja puesta desde el primer día: un hueco visible es una pregunta abierta.`}
              </p>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
