import { DECISIONES, EN_LA_MESA, decisionPorId } from './datos/index.js';
import { auditar } from './dominio/decision.js';
import { Sala } from './sala/Sala.jsx';

/*
 * Las invariantes no son decorativas: si una decisión del Consejo no se
 * sostiene, el desarrollador se entera al abrir la sala, no seis meses después.
 * En producción la sala no dice nada — el aviso es para nosotros.
 */
if (import.meta.env.DEV) {
  for (const d of DECISIONES) {
    const fallos = auditar(d);
    if (fallos.length) {
      console.warn(`[ÍTACA] ${d.id} no se sostiene:\n · ${fallos.join('\n · ')}`);
    }
  }
}

export default function App() {
  return <Sala decision={decisionPorId(EN_LA_MESA)} />;
}
