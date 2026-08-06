import { useCallback, useEffect, useState } from 'react';
import { MIEMBROS } from '../dominio/consejo.js';
import { posicionDe } from '../dominio/decision.js';
import { Escenografia } from './Escenografia.jsx';
import { Mesa } from './Mesa.jsx';
import { Silla } from './Silla.jsx';
import { Voz } from './Voz.jsx';

export function Sala({ decision }) {
  const [elegido, setElegido] = useState(null);

  /*
   * Ergonomía: la sala se recorre entera con el teclado sin tabular por
   * cinco botones. ← → giran alrededor de la mesa, 1-5 sientan directamente,
   * Esc devuelve la vista a la resolución.
   */
  const girar = useCallback((paso) => {
    setElegido((actual) => {
      if (!actual) return MIEMBROS[paso > 0 ? 0 : MIEMBROS.length - 1].id;
      const i = MIEMBROS.findIndex((m) => m.id === actual);
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

  return (
    <main className="sala">
      <Escenografia />

      <header className="cabecera">
        <p className="marca">
          ÍTACA<span> · </span>SALA DEL CONSEJO
        </p>
        <p className="sello">
          <span className="id">{decision.id}</span>
          <span>{decision.fecha}</span>
        </p>
      </header>

      <div className="escena">
        <Mesa decision={decision} />
        {MIEMBROS.map((m) => (
          <Silla
            key={m.id}
            miembro={m}
            posicion={posicionDe(decision, m.id)}
            elegida={elegido === m.id}
            onElegir={(id) => setElegido((a) => (a === id ? null : id))}
          />
        ))}
      </div>

      <p className="teclas">
        <span>
          <kbd>←</kbd>
          <kbd>→</kbd> girar
        </span>
        <span>
          <kbd>1</kbd>–<kbd>5</kbd> sentarse
        </span>
        <span>
          <kbd>Esc</kbd> resolución
        </span>
      </p>

      <Voz decision={decision} elegido={elegido} />
    </main>
  );
}
