import { useCallback, useEffect, useState } from 'react';
import { MIEMBROS } from '../dominio/consejo.js';
import { CICLO, ETIQUETA_ESTADO, posicionDe } from '../dominio/decision.js';
import { Escenografia } from './Escenografia.jsx';
import { Ficha } from './Ficha.jsx';
import { Mesa } from './Mesa.jsx';
import { Pliego } from './Pliego.jsx';
import { Sillas } from './Sillas.jsx';

export function Sala({ decision }) {
  const [elegido, setElegido] = useState(null);
  const actual = CICLO.indexOf(decision.estado);

  const girar = useCallback((paso) => {
    setElegido((a) => {
      if (!a) return MIEMBROS[paso > 0 ? 0 : MIEMBROS.length - 1].id;
      const i = MIEMBROS.findIndex((m) => m.id === a);
      return MIEMBROS[(i + paso + MIEMBROS.length) % MIEMBROS.length].id;
    });
  }, []);

  useEffect(() => {
    const alPulsar = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        girar(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        girar(-1);
      } else if (e.key === 'Escape') {
        setElegido(null);
      } else if (e.key >= '1' && e.key <= String(MIEMBROS.length)) {
        setElegido(MIEMBROS[Number(e.key) - 1].id);
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [girar]);

  /*
   * El orden de estas capas ES la profundidad de la sala. Cambiarlo la aplana:
   * villa → sillas del fondo → mesa → pliego sobre el mármol → sillas de
   * primer término → fichas.
   */
  return (
    <main className="sala">
      {/*
       * Todo vive dentro de un lienzo de 1920×1080 escalado y centrado. Los SVG
       * y el texto comparten así el mismo origen de coordenadas: si cada capa
       * se centrara por su cuenta, en cuanto la pantalla dejara de ser 16:9 el
       * pliego se despegaría de la mesa.
       */}
      <div className="lienzo">
        <Escenografia />
        <Sillas plano="fondo" elegido={elegido} />
        <Mesa />
        <Pliego decision={decision} elegido={elegido} />
        <Sillas plano="frente" elegido={elegido} />

        <div className="capa rotulos">
          <header className="cabecera">
            <p className="marca">ÍTACA</p>
            <p className="sello">Sala del Consejo</p>
          </header>

          {/* al muro sube solo la identidad de la decisión; el trabajo se queda en la mesa */}
          <div className="muro">
            <p className="eyebrow">Decisión fundacional · {decision.id}</p>
            <h1>{decision.titulo}</h1>
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
          </div>

          {MIEMBROS.map((m) => (
            <Ficha
              key={m.id}
              miembro={m}
              posicion={posicionDe(decision, m.id)}
              elegida={elegido === m.id}
              onElegir={(id) => setElegido((a) => (a === id ? null : id))}
            />
          ))}

          <p className="teclas">
            <kbd>←</kbd>
            <kbd>→</kbd> girar · <kbd>Esc</kbd> volver
          </p>
        </div>
      </div>
    </main>
  );
}
