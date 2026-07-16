/* ============================================================
   KOAPLIT — lectura de tickets y facturas (OCR en el móvil)
   Tesseract.js servido en local (vendor/) — nada sale del
   dispositivo. Carga perezosa: solo al escanear el primero.
   ============================================================ */
'use strict';

(function () {
  let workerPromesa = null;

  function cargarScript(src) {
    return new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = ko;
      document.head.appendChild(s);
    });
  }

  async function obtenerWorker(onProgreso) {
    if (!workerPromesa) {
      workerPromesa = (async () => {
        if (!window.Tesseract) await cargarScript('vendor/tesseract/tesseract.min.js');
        const worker = await window.Tesseract.createWorker('spa', 1, {
          workerPath: 'vendor/tesseract/worker.min.js',
          corePath: 'vendor/tesseract/tesseract-core-simd.wasm.js',
          langPath: 'vendor/tesseract/tessdata',
          gzip: true,
          logger: m => {
            if (m.status === 'recognizing text' && onProgreso) onProgreso(Math.round(m.progress * 100));
          }
        });
        return worker;
      })();
      workerPromesa.catch(() => { workerPromesa = null; });
    }
    return workerPromesa;
  }

  /* reduce la foto para acelerar el OCR */
  function prepararImagen(archivo) {
    return new Promise((ok, ko) => {
      const url = URL.createObjectURL(archivo);
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let { width: w, height: h } = img;
        if (Math.max(w, h) > MAX) {
          const f = MAX / Math.max(w, h);
          w = Math.round(w * f); h = Math.round(h * f);
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        // escala de grises + contraste ligero: mejora el OCR de tickets
        ctx.filter = 'grayscale(1) contrast(1.25)';
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        ok(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('imagen')); };
      img.src = url;
    });
  }

  /* extrae líneas con importe y el total del texto OCR */
  function analizarTexto(texto, moneda) {
    const lineas = [];
    let total = null, fecha = null;
    const reImporte = /(\d{1,5}[.,]\d{2})(?!\d)/g;
    const reTotal = /(total|importe|a\s*pagar|suma|amount|totale|gesamt)/i;
    const reDescartar = /(cambio|entregado|efectivo|iva|tarjeta|cash|change|devoluci)/i;

    for (const cruda of texto.split(/\n/)) {
      const linea = cruda.trim();
      if (!linea) continue;
      if (!fecha) {
        const f = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/.exec(linea);
        if (f) {
          let año = f[3].length === 2 ? '20' + f[3] : f[3];
          const d = +f[1], m = +f[2];
          if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && +año >= 2000 && +año <= 2100) {
            fecha = año + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
          }
        }
      }
      const importes = [...linea.matchAll(reImporte)].map(m2 => m2[1]);
      if (!importes.length) continue;
      const bruto = importes[importes.length - 1];
      const minor = parseImporteMon(bruto, moneda);
      if (minor == null || minor <= 0 || minor > 100000000) continue;

      if (reTotal.test(linea) && !reDescartar.test(linea)) {
        if (total == null || minor > total) total = minor;
        continue;
      }
      if (reDescartar.test(linea)) continue;
      const desc = linea.replace(reImporte, '').replace(/[€$*·:_|-]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (desc.length >= 2 && !/^\d+$/.test(desc)) {
        lineas.push({ desc: desc.slice(0, 40), importe: minor });
      }
    }
    // sin "TOTAL" explícito: el importe más alto suele ser el total
    if (total == null && lineas.length) {
      total = Math.max(...lineas.map(l => l.importe));
    }
    return { total, fecha, lineas: lineas.slice(0, 40) };
  }

  window.OCR = {
    async leerTicket(archivo, moneda, onProgreso) {
      const worker = await obtenerWorker(onProgreso);
      const canvas = await prepararImagen(archivo);
      const { data } = await worker.recognize(canvas);
      return analizarTexto(data.text || '', moneda);
    }
  };
})();
