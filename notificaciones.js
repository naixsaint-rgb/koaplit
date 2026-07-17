/* ============================================================
   KOAPLIT — avisos de cambios remotos (pareja/grupo)
   Sin servidor: solo reacciona a lo que ya llega por sync.js.
   ============================================================ */
'use strict';

(function () {
  function porId(lista) {
    const m = new Map();
    for (const x of lista) m.set(x.id, x);
    return m;
  }

  function eventoGasto(g) {
    const gr = grupo(g.grupoId) || grupoPareja();
    return { tipo: 'gasto', texto: `${emojiDe(g.pagadoPor)} ${t('pago', esc(nombre(g.pagadoPor)))}: ${esc(g.desc)} · ${fmtMon(g.importe, gr.moneda)}` };
  }
  function eventoPago(p) {
    const gr = grupo(p.grupoId) || grupoPareja();
    return { tipo: 'pago', texto: `${emojiDe(p.de)} ${esc(nombre(p.de))} → ${esc(nombre(p.para))} · ${fmtMon(p.importe, gr.moneda)}` };
  }
  function eventoAporte(o, a) {
    return { tipo: 'aporte', texto: `${emojiDe(a.miembro)} ${esc(nombre(a.miembro))} aportó ${fmt(a.importe)} a ${esc(o.nombre)} ${o.emoji}` };
  }
  function eventoMetaLograda(o) {
    return { tipo: 'metaLograda', texto: `🏆 ¡Meta conseguida! ${esc(o.nombre)} ${o.emoji}` };
  }
  function eventoCheck(r, c) {
    return { tipo: 'check', texto: `${emojiDe(c.miembro)} ${esc(nombre(c.miembro))} hizo check en ${esc(r.nombre)} ${r.emoji}` };
  }
  function eventoRetoCompletado(r) {
    return { tipo: 'retoCompletado', texto: `🏆 ¡Reto completado! ${esc(r.nombre)} ${r.emoji}` };
  }
  function eventoPortada(clave, v) {
    const [gid, ym] = clave.split('·');
    const gr = grupo(gid);
    return { tipo: 'portada', texto: `${emojiDe(v.subidoPor)} ${esc(nombre(v.subidoPor))} puso una foto en ${mesBonito(ym)}${gr && gr.id !== 'pareja' ? ' · ' + esc(nombreGrupo(gr)) : ''}` };
  }
  function eventoItemCompra(it) {
    return { tipo: 'compra', texto: `${it.categoria} ${esc(nombre(it.creadoPor))} añadió «${esc(it.texto)}» a la lista` };
  }

  /* pura: no toca `estado` ni el DOM, solo compara tres snapshots */
  function detectarEventos(antes, fusionado, remoto) {
    const eventos = [];
    if (!antes || !fusionado || !remoto) return eventos;

    const idsAntesG = new Set(antes.gastos.map(g => g.id));
    const idsRemotoG = new Set(remoto.gastos.map(g => g.id));
    for (const g of fusionado.gastos) {
      if (!idsAntesG.has(g.id) && idsRemotoG.has(g.id)) eventos.push(eventoGasto(g));
    }

    const idsAntesP = new Set(antes.pagos.map(p => p.id));
    const idsRemotoP = new Set(remoto.pagos.map(p => p.id));
    for (const p of fusionado.pagos) {
      if (!idsAntesP.has(p.id) && idsRemotoP.has(p.id)) eventos.push(eventoPago(p));
    }

    const objAntes = porId(antes.objetivos);
    const objRemoto = porId(remoto.objetivos);
    for (const o of fusionado.objetivos) {
      const oRemoto = objRemoto.get(o.id);
      if (!oRemoto) continue;
      const oAntes = objAntes.get(o.id);
      const aportesAntes = new Set(oAntes ? oAntes.aportes.map(a => a.id) : []);
      const aportesRemoto = new Set(oRemoto.aportes.map(a => a.id));
      for (const a of o.aportes) {
        if (!aportesAntes.has(a.id) && aportesRemoto.has(a.id)) eventos.push(eventoAporte(o, a));
      }
      if (o.completadoEl && (!oAntes || !oAntes.completadoEl) && oRemoto.completadoEl) eventos.push(eventoMetaLograda(o));
    }

    const retAntes = porId(antes.retos);
    const retRemoto = porId(remoto.retos);
    for (const r of fusionado.retos) {
      const rRemoto = retRemoto.get(r.id);
      if (!rRemoto) continue;
      const rAntes = retAntes.get(r.id);
      const checksAntes = new Set(rAntes ? rAntes.checks.map(c => c.fecha + '·' + c.miembro) : []);
      const checksRemoto = new Set(rRemoto.checks.map(c => c.fecha + '·' + c.miembro));
      for (const c of r.checks) {
        const k = c.fecha + '·' + c.miembro;
        if (!checksAntes.has(k) && checksRemoto.has(k)) eventos.push(eventoCheck(r, c));
      }
      if (r.estado === 'completado' && (!rAntes || rAntes.estado !== 'completado') && rRemoto.estado === 'completado') {
        eventos.push(eventoRetoCompletado(r));
      }
    }

    const clavesAntes = new Set(Object.keys(antes.portadasMes || {}));
    const clavesRemoto = new Set(Object.keys(remoto.portadasMes || {}));
    for (const [clave, v] of Object.entries(fusionado.portadasMes || {})) {
      if (!clavesAntes.has(clave) && clavesRemoto.has(clave)) eventos.push(eventoPortada(clave, v));
    }

    const idsAntesLC = new Set((antes.listaCompra || []).map(it => it.id));
    const idsRemotoLC = new Set((remoto.listaCompra || []).map(it => it.id));
    for (const it of fusionado.listaCompra || []) {
      if (!idsAntesLC.has(it.id) && idsRemotoLC.has(it.id)) eventos.push(eventoItemCompra(it));
    }

    return eventos.slice(0, 20);
  }

  /* ---------- reparto por canal ---------- */
  async function procesarEventosRemotos(eventos) {
    if (!eventos || !eventos.length) return;
    const visible = document.visibilityState === 'visible';

    if (visible && typeof toast === 'function') {
      for (const ev of eventos) toast(ev.texto);
    }

    disp.novedadesPendientes = (disp.novedadesPendientes || []).concat(
      eventos.map(e => ({ tipo: e.tipo, texto: e.texto, cuando: ahora() }))
    ).slice(-40);
    guardarDisp();

    if (!visible) {
      disp.huboEventoDeFondo = true;
      guardarDisp();
      await avisarSistema(eventos);
    }

    if (typeof render === 'function') render();
  }

  async function avisarSistema(eventos) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return; // el prompt contextual se ofrece desde la UI
    try {
      const texto = eventos.length === 1 ? eventos[0].texto : `🔔 ${eventos.length} novedades de ${esc(nombre('a'))} + ${esc(nombre('b'))}`;
      const reg = await navigator.serviceWorker.getRegistration();
      const opciones = { body: texto, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'koaplit-cambios' };
      if (reg && reg.showNotification) reg.showNotification('KOAPLIT', opciones);
      else new Notification('KOAPLIT', opciones);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    } catch (_) {}
  }

  window.NOTIF = { detectarEventos, procesarEventosRemotos };
})();
