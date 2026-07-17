/* ============================================================
   KOAPLIT v2 — interfaz: vistas, hojas y acciones
   ============================================================ */
'use strict';

/* ---------- constantes de UI ---------- */
const CATEGORIAS = [
  ['🛒', 'catSuper'], ['🍽️', 'catFuera'], ['🏠', 'catCasa'], ['🚗', 'catTransporte'],
  ['🎬', 'catOcio'], ['✈️', 'catViajes'], ['💊', 'catSalud'], ['🎁', 'catRegalos'], ['📦', 'catOtros']
];
const nombreCategoria = e => { const c = CATEGORIAS.find(x => x[0] === e); return c ? t(c[1]) : t('catOtros'); };

const EMOJIS_META = ['⛷️', '🏔️', '🏖️', '✈️', '🏠', '💍', '🚗', '🎸', '🐶', '🎓', '🛋️', '💆'];
const SUGERENCIAS_META = () => [
  { emoji: '⛷️', nombre: t('sugNieve'), meta: 90000 },
  { emoji: '🏖️', nombre: t('sugVerano'), meta: 120000 },
  { emoji: '🏔️', nombre: t('sugFinde'), meta: 30000 }
];
const EMOJIS_RETO = ['🎿', '☕', '🍕', '🧗', '🛒', '💪', '🚭', '🎮', '🍺', '✨'];
const PLANTILLAS_RETO = () => [
  { emoji: '🎿', nombre: t('plNieve'), desc: t('plNieveDesc'), importe: 500, checks: 20, modo: 'fijo' },
  { emoji: '☕', nombre: t('plCafe'), desc: t('plCafeDesc'), importe: 250, checks: 14, modo: 'fijo' },
  { emoji: '🍕', nombre: t('plDelivery'), desc: t('plDeliveryDesc'), importe: 1500, checks: 4, modo: 'fijo' },
  { emoji: '🧗', nombre: t('plEscalera'), desc: t('plEscaleraDesc'), importe: 100, checks: 15, modo: 'creciente' },
  { emoji: '🛒', nombre: t('plLista'), desc: t('plListaDesc'), importe: 400, checks: 10, modo: 'fijo' }
];
const EMOJIS_GRUPO = ['🏔️', '🍻', '🏡', '🚐', '⚽', '🎉', '💼', '🌊'];
const EMOJIS_PERSONA = ['🦊', '🐨', '🐻', '🦉', '🐺', '🐰', '🦝', '🐹', '🦌', '🐱', '🐭'];
const METODOS_PAGO = () => [['efectivo', t('efectivo')], ['bizum', t('bizum')], ['transferencia', t('transferencia')], ['paypal', t('paypal')], ['tarjeta', t('tarjeta')]];

/* ---------- estado de la interfaz ---------- */
let vistaActual = 'inicio';
let grupoActivo = 'pareja';
let busqueda = '';
let tmp = {};
let confirmCb = null;
let timerCierreSheet = null;
let sheetEnHistorial = false;
let csvFilas = null;

/* ---------- utilidades UI ---------- */
function toast(msg) {
  const c = $('#toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.classList.add('saliendo'), 2400);
  setTimeout(() => el.remove(), 2750);
}
function vibrar(ms) { if (navigator.vibrate) try { navigator.vibrate(ms); } catch (_) {} }

function confeti() {
  const canvas = $('#confetti');
  canvas.hidden = false;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colores = ['#6FF5C8', '#FF9A7B', '#7FC4FF', '#FFD37A', '#F2F7FB', '#B89CFF'];
  const parts = Array.from({ length: 150 }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 140, y: innerHeight * 0.45,
    vx: (Math.random() - .5) * 13, vy: -Math.random() * 14 - 5,
    w: 5 + Math.random() * 6, h: 8 + Math.random() * 7,
    rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
    color: colores[Math.floor(Math.random() * colores.length)]
  }));
  const inicio = performance.now();
  (function paso(t2) {
    const dt = (t2 - inicio) / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.42; p.vx *= 0.99; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - dt / 2.6);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (dt < 2.7) requestAnimationFrame(paso);
    else { ctx.clearRect(0, 0, innerWidth, innerHeight); canvas.hidden = true; }
  })(inicio);
}

/* ---------- hojas (sheets) ---------- */
function abrirSheet(html) {
  clearTimeout(timerCierreSheet);
  const velo = $('#velo');
  velo.classList.remove('cerrando');
  velo.style.pointerEvents = '';
  $('#sheet').innerHTML = '<div class="sheet-asa"></div>' + html;
  $('#sheet').scrollTop = 0;
  velo.hidden = false;
  if (!sheetEnHistorial) {
    try { history.pushState({ koaplitSheet: true }, ''); sheetEnHistorial = true; } catch (_) {}
  }
}
function cerrarSheet(desdeAtras) {
  const velo = $('#velo');
  if (velo.hidden) return;
  velo.style.pointerEvents = 'none'; // evita dobles taps durante la animación
  velo.classList.add('cerrando');
  clearTimeout(timerCierreSheet);
  timerCierreSheet = setTimeout(() => {
    velo.hidden = true;
    $('#sheet').innerHTML = '';
    velo.classList.remove('cerrando');
    velo.style.pointerEvents = '';
  }, 210);
  if (sheetEnHistorial && !desdeAtras) {
    sheetEnHistorial = false;
    try { history.back(); } catch (_) {}
  } else if (desdeAtras) {
    sheetEnHistorial = false;
  }
}
window.addEventListener('popstate', () => {
  if (!$('#velo').hidden) cerrarSheet(true);
});

function errorForm(msg) {
  const e = $('#error-form');
  if (e) { e.textContent = msg; e.hidden = false; }
  vibrar([30, 40, 30]);
}

const segmento = (id, opciones, activo, accion, coral) => `
  <div class="segmentos ${coral ? 'coralizado' : ''}" id="${id}">
    ${opciones.map(o => `<button type="button" data-action="${accion}" data-valor="${esc(o[0])}" class="${o[0] === activo ? 'activo' : ''}">${o[1]}</button>`).join('')}
  </div>`;

const segPersonas = (id, miembros, activo, accion) => segmento(
  id, miembros.map(pid => [pid, `${emojiDe(pid)} ${esc(nombre(pid))}`]), activo, accion
);

function marcarActivo(btn) {
  const grupoEl = btn.closest('.segmentos, .chips');
  if (grupoEl) grupoEl.querySelectorAll('button').forEach(x => x.classList.toggle('activo', x === btn));
}
function textoEmojiActivo(grupoNombre) {
  const raiz = !$('#velo').hidden ? '#sheet ' : '#onboarding ';
  const el = document.querySelector(`${raiz}.emojis[data-para="${grupoNombre}"] button.activo`);
  return el ? el.textContent : null;
}

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  try { renderInterno(); } catch (err) {
    console.error('render:', err);
    try {
      vistaActual = 'inicio';
      renderInterno();
    } catch (_) {
      toast('⚠️ Error al pintar. Reinicia la app.');
    }
  }
}

function renderInterno() {
  const onb = $('#onboarding');
  const app = $('#app');
  onb.hidden = hayPareja();
  app.hidden = !hayPareja();
  actualizarTextosFijos();
  if (!hayPareja()) return;

  document.querySelectorAll('#navegacion button').forEach(b => b.classList.toggle('activo', b.dataset.vista === vistaActual));
  ['inicio', 'gastos', 'metas', 'retos'].forEach(v => { $('#vista-' + v).hidden = v !== vistaActual; });
  $('#vista-' + vistaActual).innerHTML = { inicio: vInicio, gastos: vGastos, metas: vMetas, retos: vRetos }[vistaActual]();
}

function actualizarTextosFijos() {
  const set = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  set('.onb-lema', t('lema'));
  set('label[for="nombre-a"]', t('tu'));
  set('label[for="nombre-b"]', t('tuPareja'));
  const na = $('#nombre-a'); if (na) na.placeholder = t('tuNombre');
  const nb = $('#nombre-b'); if (nb) nb.placeholder = t('suNombre');
  set('#btnGuardarNombres', t('guardarNombres'));
  set('#btnCreateRoom', t('crearSala'));
  set('#btnJoinRoom', t('unirseSala'));
  const rc = $('#roomCodeInput'); if (rc) rc.placeholder = t('seisDigitos');
  document.querySelectorAll('#navegacion button span').forEach((s, i) => {
    s.textContent = [t('inicio'), t('gastos'), t('metas'), t('retos')][i];
  });
}

/* ============================================================
   VISTA: INICIO (la pareja)
   ============================================================ */
function mensajeKoala() {
  const neto = balanceParejaNetoA();
  const retosActivos = estado.retos.filter(r => r.estado === 'activo');
  const pendienteHoy = retosActivos.find(r => !yaCheckeoHoy(r, 'a') || !yaCheckeoHoy(r, 'b'));
  const metaCerca = estado.objetivos.find(o => !o.completadoEl && o.meta > 0 && aportadoMeta(o) / o.meta >= 0.75);
  if (metaCerca) return t('koalaMetaCerca', esc(metaCerca.nombre), Math.floor(aportadoMeta(metaCerca) / metaCerca.meta * 100), metaCerca.emoji);
  if (pendienteHoy) return t('koalaCheckPendiente', esc(pendienteHoy.nombre), pendienteHoy.emoji);
  if (neto !== 0) {
    const deudor = neto > 0 ? 'b' : 'a';
    return t('koalaDeuda', esc(nombre(deudor)), fmt(Math.abs(neto)));
  }
  const total = ahorradoJuntos();
  if (total > 0) return t('koalaAhorro', fmt(total));
  return t('koalaHola', esc(nombre('a')), esc(nombre('b')));
}

/* ---------- avisos: prompt de permiso + banner de novedades ---------- */
function htmlPromptAvisos() {
  const soportado = 'Notification' in window;
  if (!soportado || Notification.permission !== 'default' || !disp.huboEventoDeFondo || disp.avisosOfrecidos) return '';
  return `<div class="carta prompt-avisos">
    <span class="prompt-avisos-emoji">🔔</span>
    <div class="prompt-avisos-texto">¿Avisos aunque no estés mirando la app?</div>
    <button class="btn-suave" data-action="ignorar-prompt-avisos">Ahora no</button>
    <button class="btn-principal prompt-avisos-btn" data-action="activar-avisos">Activar</button>
  </div>`;
}

function htmlBannerNovedades() {
  const lista = disp.novedadesPendientes || [];
  if (!lista.length) return '';
  const abierto = !!tmp.novedadesAbiertas;
  return `<div class="banner-novedades">
    <button type="button" class="banner-novedades-cab" data-action="alternar-novedades">
      <span>🔔 ${lista.length === 1 ? '1 novedad' : lista.length + ' novedades'} mientras no estabas</span>
      <span class="banner-flecha">${abierto ? '▴' : '▾'}</span>
    </button>
    ${abierto ? `<div class="banner-novedades-lista">
      ${[...lista].reverse().map(e => `<div class="banner-novedad-item">${e.texto}</div>`).join('')}
      <button type="button" class="btn-suave btn-bloque" data-action="descartar-novedades">Descartar</button>
    </div>` : ''}
  </div>`;
}

function vInicio() {
  const neto = balanceParejaNetoA();
  const racha = rachaDias();
  const metasActivas = estado.objetivos.filter(o => !o.completadoEl).slice(0, 2);
  const retosActivos = estado.retos.filter(r => r.estado === 'activo');

  let centro;
  if (neto === 0) {
    centro = `<div class="balance-etiqueta">${t('balancePareja', esc(nombre('a')) + ' + ' + esc(nombre('b')))}</div>
      <div class="balance-cifra">🕊️</div><div class="balance-cero">${t('enPaz')}</div>`;
  } else {
    const deudor = neto > 0 ? 'b' : 'a';
    const acreedor = elOtro(deudor);
    centro = `<div class="balance-etiqueta">${t('balancePareja', esc(nombre('a')) + ' + ' + esc(nombre('b')))}</div>
      <div class="balance-cifra ${deudor === 'b' ? 'positivo' : 'negativo'}">${fmt(Math.abs(neto))}</div>
      <div class="balance-quien">${emojiDe(deudor)} ${t('leDebe', '<b>' + esc(nombre(deudor)) + '</b>', '<b>' + esc(nombre(acreedor)) + '</b>')} ${emojiDe(acreedor)}</div>`;
  }

  let h = htmlPromptAvisos() + htmlBannerNovedades();
  h += `<div class="saludo-koala"><span class="koala">🐨</span><div class="burbuja">${mensajeKoala()}</div></div>
    <div class="carta carta-balance">
      <div class="nieve-mini" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      ${centro}
      <div class="balance-acciones">
        ${neto !== 0 ? `<button class="btn-suave" data-action="abrir-saldar" data-grupo="pareja">${t('saldar')}</button>` : ''}
        <button class="btn-principal" data-action="nuevo-gasto" data-grupo="pareja">${t('anadirGasto')}</button>
      </div>
      <svg class="montes-mini" viewBox="0 0 480 54" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 54 L60 18 L110 42 L180 6 L250 44 L320 16 L390 46 L480 22 L480 54 Z" fill="rgba(127,196,255,.10)"/>
        <path d="M0 54 L90 32 L170 50 L250 20 L340 50 L430 30 L480 54 Z" fill="rgba(111,245,200,.12)"/>
      </svg>
    </div>
    <div class="fila-stats">
      <div class="stat menta"><div class="stat-etq">${t('ahorradoJuntos')}</div><div class="stat-num">${fmt(ahorradoJuntos())}</div></div>
      <div class="stat oro"><div class="stat-etq">${t('rachaRetos')}</div><div class="stat-num">${racha} ${racha === 1 ? t('dia') : t('dias')}</div></div>
    </div>`;

  h += `<div class="subtitulo">${t('metasEnMarcha')}</div>`;
  if (metasActivas.length) h += metasActivas.map(htmlCartaMeta).join('');
  else if (estado.objetivos.length) h += `<div class="vacio"><span class="vacio-emoji">🏆</span><p>${t('todoConseguido')}</p>
    <button class="btn-suave" data-action="nueva-meta">${t('nuevaMeta')}</button></div>`;
  else h += `<div class="vacio"><span class="vacio-emoji">🏔️</span><p>${t('sinMetas')}</p>
    <button class="btn-suave" data-action="nueva-meta">${t('crearPrimeraMeta')}</button></div>`;

  h += `<div class="subtitulo">${t('retosActivos')}</div>`;
  if (retosActivos.length) {
    h += retosActivos.map(r => {
      const listo = r.checks.length >= r.checksMeta;
      return `<div class="item-linea" role="button" tabindex="0" data-action="abrir-reto" data-id="${r.id}">
        <span class="item-icono">${r.emoji}</span>
        <span class="item-cuerpo">
          <span class="item-titulo">${esc(r.nombre)}</span>
          <span class="item-sub">${t('checksDe', r.checks.length, r.checksMeta)} · ${t('ahorrados', fmt(ahorroReto(r)))}</span>
        </span>
        <span class="pastilla ${listo ? 'oro' : 'menta'}">${listo ? t('listo') : (yaCheckeoHoy(r, 'a') && yaCheckeoHoy(r, 'b') ? t('hoyHecho') : t('checkHoy'))}</span>
      </div>`;
    }).join('');
  } else {
    h += `<div class="vacio"><span class="vacio-emoji">🔥</span><p>${t('sinRetos')}</p>
      <button class="btn-suave" data-action="ir" data-vista="retos">${t('verRetos')}</button></div>`;
  }

  const eventos = ultimaActividad(6);
  if (eventos.length) {
    h += `<div class="subtitulo">${t('ultimaActividad')}</div>` + eventos.map(e => `
      <div class="item-linea" ${e.accion ? `role="button" tabindex="0" data-action="${e.accion}" data-id="${e.id}"` : ''}>
        <span class="item-icono">${e.icono}</span>
        <span class="item-cuerpo"><span class="item-titulo">${e.titulo}</span><span class="item-sub">${e.sub}</span></span>
        <span class="item-importe ${e.clase || ''}">${e.importe}</span>
      </div>`).join('');
  }
  return h;
}

function ultimaActividad(n) {
  const ev = [];
  for (const g of estado.gastos) {
    const gr = grupo(g.grupoId);
    ev.push({
      orden: g.mod, icono: g.categoria, titulo: esc(g.desc),
      sub: `${t('pago', esc(nombre(g.pagadoPor)))} · ${gr && gr.id !== 'pareja' ? esc(nombreGrupo(gr)) + ' · ' : ''}${fechaBonita(g.fecha)}`,
      importe: fmtMon(g.importe, gr ? gr.moneda : monedaPareja()), accion: 'abrir-gasto', id: g.id
    });
  }
  for (const p of estado.pagos) ev.push({
    orden: p.mod, icono: '🤝', titulo: t('cuentasSaldadas'),
    sub: `${esc(nombre(p.de))} → ${esc(nombre(p.para))} · ${fechaBonita(p.fecha)}`,
    importe: fmtMon(p.importe, (grupo(p.grupoId) || {}).moneda || monedaPareja()), clase: 'tinta-menta'
  });
  for (const o of estado.objetivos) for (const a of o.aportes) ev.push({
    orden: a.creadoEl, icono: o.emoji, titulo: `${t('aportar').replace('＋ ', '')} → ${esc(o.nombre)}`,
    sub: `${esc(nombre(a.miembro))}${a.origen ? ' · «' + esc(a.origen) + '»' : ''} · ${fechaBonita(a.fecha)}`,
    importe: '+' + fmt(a.importe), clase: 'tinta-menta', accion: 'abrir-meta', id: o.id
  });
  for (const r of estado.retos) if (r.estado === 'completado') ev.push({
    orden: r.finalizadoEl, icono: '🏆', titulo: `${t('completado')}: ${esc(r.nombre)}`,
    sub: fechaBonita((r.finalizadoEl || '').slice(0, 10)), importe: fmt(ahorroReto(r)), clase: 'tinta-oro'
  });
  return ev.sort((x, y) => String(y.orden || '').localeCompare(String(x.orden || ''))).slice(0, n);
}

/* ---------- portada de mes ---------- */
function htmlPortadaMes(grupoId, ym) {
  const p = portadaMes(grupoId, ym);
  if (p) {
    return `<div class="portada-mes" style="background-image:url('${p.dataUrl}')">
      <div class="portada-mes-velo"></div>
      <button type="button" class="portada-mes-quitar" data-action="quitar-portada-mes" data-grupo="${grupoId}" data-ym="${ym}" aria-label="Quitar foto">✕</button>
    </div>`;
  }
  return `<button type="button" class="portada-mes-vacia" data-action="subir-portada-mes" data-grupo="${grupoId}" data-ym="${ym}">
    🖼️ Poner una foto de este mes
  </button>`;
}

/* ============================================================
   VISTA: GASTOS (grupos, búsqueda, totales)
   ============================================================ */
function vGastos() {
  if (!grupo(grupoActivo)) grupoActivo = 'pareja';
  const g = grupo(grupoActivo);
  const netos = netosGrupo(grupoActivo);
  const transferencias = simplificarDeudas(netos);

  let h = `<h2 class="titulo-vista">${t('gastos')}<small>${t('gastosLema')}</small></h2>`;

  // selector de grupos
  h += `<div class="chips chips-grupos">
    ${estado.grupos.map(gr => `<button type="button" class="${gr.id === grupoActivo ? 'activo' : ''}" data-action="elegir-grupo" data-id="${gr.id}">${gr.emoji} ${esc(nombreGrupo(gr))}</button>`).join('')}
    <button type="button" data-action="nuevo-grupo">＋</button>
    <button type="button" data-action="editar-grupo" data-id="${grupoActivo}" aria-label="${t('editarGrupo')}">⚙️</button>
  </div>`;

  // deudas del grupo
  if (transferencias.length) {
    h += `<div class="carta" style="padding:14px 16px">
      ${transferencias.slice(0, 4).map(tr => `
        <div style="display:flex;align-items:center;gap:8px;font-size:14px;padding:3px 0">
          <span>${emojiDe(tr.de)}</span>
          <span style="flex:1;color:var(--bruma)"><b style="color:var(--nieve)">${esc(nombre(tr.de))}</b> ${t('debe')} <b class="tinta-coral" style="font-family:var(--fuente-num)">${fmtMon(tr.importe, g.moneda)}</b> → <b style="color:var(--nieve)">${esc(nombre(tr.para))}</b></span>
        </div>`).join('')}
      <button class="btn-suave" style="margin-top:8px" data-action="abrir-saldar" data-grupo="${grupoActivo}">${t('saldar')}</button>
    </div>`;
  } else if (gastosDe(grupoActivo).length) {
    h += `<div class="carta" style="display:flex;align-items:center;gap:10px;padding:13px 16px">
      <span style="font-size:22px">🕊️</span><span style="color:var(--bruma);font-size:14px">${t('sinDeudas')}</span>
    </div>`;
  }

  // barra de herramientas
  h += `<div class="chips" style="margin-top:12px">
    <button type="button" data-action="abrir-totales">${t('totales')}</button>
    <button type="button" data-action="abrir-recurrentes">${t('recurrentes')}</button>
    <button type="button" data-action="abrir-csv">${t('importarCSV')}</button>
  </div>`;

  // búsqueda
  h += `<div class="campo" style="margin:12px 0 0">
    <input id="buscador" type="text" placeholder="${t('buscar')}" value="${esc(busqueda)}" autocomplete="off">
  </div>`;

  const gastos = gastosDe(grupoActivo).filter(x => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return x.desc.toLowerCase().includes(q) || nombreCategoria(x.categoria).toLowerCase().includes(q)
      || nombre(x.pagadoPor).toLowerCase().includes(q) || x.categoria.includes(q);
  });

  if (!gastosDe(grupoActivo).length) {
    h += `<div class="vacio" style="margin-top:14px"><span class="vacio-emoji">🧾</span><p>${t('sinGastos')}</p>
      <button class="btn-suave" data-action="nuevo-gasto" data-grupo="${grupoActivo}">${t('primerGasto')}</button></div>`;
    return h;
  }
  if (!gastos.length) {
    h += `<div class="vacio" style="margin-top:14px"><span class="vacio-emoji">🔍</span><p>${t('sinResultados')}</p></div>`;
    return h;
  }

  const orden = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha) || String(b.mod).localeCompare(String(a.mod)));
  const grupos = {};
  for (const x of orden) (grupos[x.fecha.slice(0, 7)] = grupos[x.fecha.slice(0, 7)] || []).push(x);
  for (const ym of Object.keys(grupos)) {
    const gs = grupos[ym];
    const total = gs.reduce((s, x) => s + x.importe, 0);
    const porPersona = {};
    for (const x of gs) porPersona[x.pagadoPor] = (porPersona[x.pagadoPor] || 0) + x.importe;
    h += `<div class="mes-grupo">${htmlPortadaMes(g.id, ym)}<div class="mes-cabecera"><span>${mesBonito(ym)}</span></div>`;
    h += gs.map(x => `
      <div class="item-linea" role="button" tabindex="0" data-action="abrir-gasto" data-id="${x.id}">
        <span class="item-icono">${x.categoria}</span>
        <span class="item-cuerpo">
          <span class="item-titulo">${esc(x.desc)}</span>
          <span class="item-sub">${emojiDe(x.pagadoPor)} ${t('pago', esc(nombre(x.pagadoPor)))} · ${etiquetaReparto(x)} · ${fechaBonita(x.fecha)}</span>
        </span>
        <span class="item-importe">${fmtMon(x.importe, g.moneda)}
          ${x.moneda !== g.moneda ? `<small>${fmtMon(x.importeOriginal, x.moneda)}</small>` : ''}
        </span>
      </div>`).join('');
    // cierre del mes: total + quién pagó cuánto
    h += `<div class="mes-total">
      <div class="mes-total-fila">
        <span>Σ ${t('total')} · ${mesBonito(ym)}</span>
        <b>${fmtMon(total, g.moneda)}</b>
      </div>
      <div class="mes-total-personas">
        ${Object.entries(porPersona).map(([pid, v]) => `<span>${emojiDe(pid)} ${esc(nombre(pid))} <b>${fmtMon(v, g.moneda)}</b></span>`).join('')}
      </div>
    </div></div>`;
  }
  return h;
}

/* ============================================================
   VISTA: METAS
   ============================================================ */
function htmlCartaMeta(o) {
  const ap = aportadoMeta(o);
  const pct = o.meta > 0 ? Math.min(100, ap / o.meta * 100) : 0;
  const completada = !!o.completadoEl;
  let fechaTxt = '';
  if (completada) fechaTxt = t('conseguida');
  else if (o.fechaLimite) {
    const d = diasRestantes(o.fechaLimite);
    fechaTxt = d > 1 ? t('quedanDias', d) : d === 1 ? t('esManana') : d === 0 ? t('esHoy') : t('pasoHace', -d);
  }
  return `<div class="carta carta-meta" role="button" tabindex="0" data-action="abrir-meta" data-id="${o.id}">
    <div class="meta-cab">
      <span class="meta-emoji">${o.emoji}</span>
      <div style="flex:1;min-width:0">
        <div class="meta-nombre">${esc(o.nombre)}</div>
        <div class="meta-fecha">${fechaTxt}</div>
      </div>
      ${completada ? `<span class="insignia-completada">${t('lograda')}</span>`
        : `<button class="btn-suave" data-action="abrir-aporte" data-id="${o.id}">${t('aportar')}</button>`}
    </div>
    <div class="meta-cifras"><span class="meta-actual">${fmt(ap)}</span><span class="meta-total">${t('de')} ${fmt(o.meta)}</span></div>
    <div class="barra ${completada ? 'oro' : ''}"><i style="width:${pct}%"></i></div>
    <div class="meta-pie">
      <span class="meta-porcentaje">${Math.floor(pct)}%</span>
      <span class="meta-aportes-mini">
        <span>${emojiDe('a')} <b class="tinta-menta">${fmt(aportadoMetaDe(o, 'a'))}</b></span>
        <span>${emojiDe('b')} <b class="tinta-coral">${fmt(aportadoMetaDe(o, 'b'))}</b></span>
      </span>
    </div>
  </div>`;
}

function vMetas() {
  let h = `<h2 class="titulo-vista">${t('metas')}<small>${t('metasLema')}</small></h2>`;
  const activas = estado.objetivos.filter(o => !o.completadoEl);
  const logradas = estado.objetivos.filter(o => o.completadoEl);
  if (!estado.objetivos.length) {
    h += `<div class="vacio"><span class="vacio-emoji">⛷️</span><p>${t('metasVacio')}</p>
      <button class="btn-suave" data-action="nueva-meta">${t('crearMeta')}</button></div>`;
    return h;
  }
  if (activas.length) h += activas.map(htmlCartaMeta).join('');
  else h += `<div class="vacio"><span class="vacio-emoji">🎯</span><p>${t('todoConseguido')}</p>
    <button class="btn-suave" data-action="nueva-meta">${t('nuevaMeta')}</button></div>`;
  if (logradas.length) h += `<div class="subtitulo">${t('conseguidas')}</div>` + logradas.map(htmlCartaMeta).join('');
  return h;
}

/* ============================================================
   VISTA: RETOS
   ============================================================ */
function htmlChecksGrid(r) {
  let celdas = '';
  for (let i = 0; i < r.checksMeta; i++) {
    const c = r.checks[i];
    celdas += `<i class="${c ? 'hecho' + (c.miembro === 'b' ? ' b' : '') : ''}"></i>`;
  }
  return `<div class="reto-checks">${celdas}</div>`;
}

function vRetos() {
  const racha = rachaDias();
  let h = `<h2 class="titulo-vista">${t('retos')}<small>${t('retosLema')}</small></h2>
    <div class="reto-racha"><span class="llama">🔥</span><div>
      <div class="racha-num">${t('diasRacha', racha, racha === 1 ? t('dia') : t('dias'))}</div>
      <div class="racha-etq">${racha > 0 ? t('rachaViva') : t('rachaApagada')}</div>
    </div></div>`;

  const activos = estado.retos.filter(r => r.estado === 'activo');
  if (activos.length) {
    h += activos.map(r => {
      const listo = r.checks.length >= r.checksMeta;
      const meta = r.objetivoId ? estado.objetivos.find(o => o.id === r.objetivoId) : null;
      return `<div class="carta carta-reto" role="button" tabindex="0" data-action="abrir-reto" data-id="${r.id}">
        <div class="meta-cab">
          <span class="meta-emoji">${r.emoji}</span>
          <div style="flex:1;min-width:0">
            <div class="meta-nombre">${esc(r.nombre)}</div>
            <div class="meta-fecha">${fmt(ahorroReto(r))} ${t('de')} ${fmt(metaAhorroReto(r))} · ${meta ? esc(meta.nombre) + ' ' + meta.emoji : t('huchaLibre')}</div>
          </div>
          <span class="pastilla ${listo ? 'oro' : 'menta'}">${r.checks.length}/${r.checksMeta}</span>
        </div>
        ${htmlChecksGrid(r)}
        <div class="acciones-sheet" style="margin-top:14px">
          ${listo
            ? `<button class="btn-principal btn-bloque" data-action="completar-reto" data-id="${r.id}">${t('completarReto')}</button>`
            : `<button class="btn-suave" style="flex:1" data-action="checkin" data-id="${r.id}" data-miembro="a" ${yaCheckeoHoy(r, 'a') ? 'disabled' : ''}>${yaCheckeoHoy(r, 'a') ? '✓ ' : ''}${emojiDe('a')} ${esc(nombre('a'))}</button>
               <button class="btn-suave" style="flex:1" data-action="checkin" data-id="${r.id}" data-miembro="b" ${yaCheckeoHoy(r, 'b') ? 'disabled' : ''}>${yaCheckeoHoy(r, 'b') ? '✓ ' : ''}${emojiDe('b')} ${esc(nombre('b'))}</button>`}
        </div>
      </div>`;
    }).join('');
  } else {
    h += `<div class="vacio"><span class="vacio-emoji">🧊</span><p>${t('retosVacio')}</p></div>`;
  }

  h += `<div class="subtitulo">${t('empezarReto')}</div>`;
  h += PLANTILLAS_RETO().map((p, i) => `
    <div class="item-linea plantilla-reto" role="button" tabindex="0" data-action="elegir-plantilla" data-idx="${i}">
      <span class="item-icono">${p.emoji}</span>
      <span class="item-cuerpo"><span class="item-titulo">${esc(p.nombre)}</span><span class="item-sub">${esc(p.desc)}</span></span>
      <span class="pastilla">${fmt(p.importe)}${p.modo === 'creciente' ? '↗' : ''}</span>
    </div>`).join('');
  h += `<div class="item-linea plantilla-reto" role="button" tabindex="0" data-action="nuevo-reto">
      <span class="item-icono">✨</span>
      <span class="item-cuerpo"><span class="item-titulo">${t('retoPersonalizado')}</span><span class="item-sub">${t('retoPersonalizadoDesc')}</span></span>
    </div>`;

  const historial = estado.retos.filter(r => r.estado !== 'activo');
  if (historial.length) {
    h += `<div class="subtitulo">${t('historial')}</div>` + historial.map(r => `
      <div class="item-linea">
        <span class="item-icono">${r.estado === 'completado' ? '🏆' : '🪦'}</span>
        <span class="item-cuerpo"><span class="item-titulo">${esc(r.nombre)}</span>
          <span class="item-sub">${r.estado === 'completado' ? t('completado') : t('abandonado')} · ${fechaBonita((r.finalizadoEl || r.mod || '').slice(0, 10))}</span></span>
        <span class="item-importe ${r.estado === 'completado' ? 'tinta-oro' : 'tinta-bruma'}">${fmt(ahorroReto(r))}</span>
      </div>`).join('');
  }
  return h;
}

/* ============================================================
   HOJA: GASTO (nuevo / editar)
   ============================================================ */
function sheetGasto(g, grupoId) {
  const gr = grupo(g ? g.grupoId : (grupoId || grupoActivo)) || grupoPareja();
  const def = !g && gr.repartoDef ? gr.repartoDef : null;
  tmp = {
    editando: g ? g.id : null,
    grupoId: gr.id,
    moneda: g ? g.moneda : gr.moneda,
    tasa: g ? g.tasa : 1,
    pagadoPor: g ? g.pagadoPor : (gr.miembros.includes(disp.yo) ? disp.yo : gr.miembros[0]),
    categoria: g ? g.categoria : '🛒',
    tipo: g ? g.reparto.tipo : (def ? def.tipo : 'mitad'),
    participantes: new Set(g ? g.reparto.participantes : (def && def.participantes.every(p => gr.miembros.includes(p)) ? def.participantes : gr.miembros)),
    datos: g ? Object.assign({}, g.reparto.datos) : (def ? Object.assign({}, def.datos) : {}),
    items: g ? (g.items || []).slice() : [],
    recurrente: false, frecuencia: 'mensual'
  };
  if (g && g.reparto.tipo === 'exacto') tmp.datos = Object.assign({}, g.partes);

  abrirSheet(`
    <h3 class="sheet-titulo">${g ? t('editarGasto') : t('nuevoGasto')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="fila-importe-moneda">
      <div class="campo campo-importe" style="flex:1">
        <label for="imp-gasto">${t('importe')}</label>
        <input id="imp-gasto" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off" value="${g ? aDecimalMon(g.importeOriginal, g.moneda) : ''}">
      </div>
      <div class="campo" style="width:104px">
        <label for="mon-gasto">${t('moneda')}</label>
        <select id="mon-gasto">${LISTA_MONEDAS.map(m => `<option value="${m}" ${m === tmp.moneda ? 'selected' : ''}>${m}</option>`).join('')}</select>
      </div>
    </div>
    <div id="zona-tasa">${htmlZonaTasa(gr)}</div>
    <button type="button" class="btn-suave btn-bloque" id="btn-ocr" data-action="escanear-ticket" style="margin-bottom:15px">${t('escanearTicket')}</button>
    <div id="zona-items">${htmlZonaItems()}</div>
    <div class="campo">
      <label for="desc-gasto">${t('enQue')}</label>
      <input id="desc-gasto" type="text" maxlength="60" placeholder="${t('descPlaceholder')}" autocomplete="off" value="${g ? esc(g.desc) : ''}">
    </div>
    <div class="campo"><label>${t('categoria')}</label>
      <div class="chips" id="chips-cat">
        ${CATEGORIAS.map(c => `<button type="button" data-action="elegir-cat" data-valor="${c[0]}" class="${c[0] === tmp.categoria ? 'activo' : ''}">${c[0]} ${t(c[1])}</button>`).join('')}
      </div>
    </div>
    <div class="campo"><label>${t('quienPago')}</label>${segPersonas('seg-pagador', gr.miembros, tmp.pagadoPor, 'elegir-pagador')}</div>
    ${gr.miembros.length > 2 ? `<div class="campo"><label>${t('participantes')}</label>
      <div class="chips" id="chips-participantes">
        ${gr.miembros.map(pid => `<button type="button" data-action="alternar-participante" data-valor="${pid}" class="${tmp.participantes.has(pid) ? 'activo' : ''}">${emojiDe(pid)} ${esc(nombre(pid))}</button>`).join('')}
      </div></div>` : ''}
    <div class="campo"><label>${t('comoReparte')}</label>
      ${segmento('seg-tipo', [['mitad', t('repIgual')], ['exacto', t('repExacto')], ['porcentaje', t('repPorcentaje')], ['cuotas', t('repCuotas')], ['uno', t('repUno')]], tmp.tipo, 'elegir-tipo')}
    </div>
    <div id="zona-reparto">${htmlZonaReparto()}</div>
    <div class="campo">
      <label for="fecha-gasto">${t('fecha')}</label>
      <input id="fecha-gasto" type="date" value="${g ? g.fecha : hoyISO()}">
    </div>
    ${!g ? `<div class="campo">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;text-transform:none;font-size:14px;letter-spacing:0">
        <input type="checkbox" id="chk-recurrente" style="width:18px;height:18px;accent-color:#6FF5C8"> ${t('repetirGasto')}
      </label>
      <div id="zona-frecuencia" hidden style="margin-top:10px">
        ${segmento('seg-frec', [['semanal', t('semanal')], ['quincenal', t('quincenal')], ['mensual', t('mensual')]], 'mensual', 'elegir-frecuencia')}
      </div>
    </div>` : ''}
    <p class="error-form" id="error-form" hidden></p>
    <div class="acciones-sheet">
      ${g ? `<button class="btn-suave btn-peligro" data-action="eliminar-gasto" data-id="${g.id}">🗑️</button>` : ''}
      <button class="btn-principal" data-action="guardar-gasto">${g ? t('guardarCambios') : t('anadirGastoBtn')}</button>
    </div>
    <input type="file" id="foto-ticket" accept="image/*" capture="environment" hidden>
  `);
  if (!g) setTimeout(() => { const el = $('#imp-gasto'); if (el) el.focus(); }, 350);
}

function htmlZonaTasa(gr) {
  if (tmp.moneda === gr.moneda) return '';
  tmp.tasa = tmp.tasa && tmp.tasa !== 1 ? tmp.tasa : tasaCambio(tmp.moneda, gr.moneda);
  return `<div class="campo">
    <label for="tasa-gasto">${t('tasaCambio', gr.moneda)}</label>
    <input id="tasa-gasto" type="text" inputmode="decimal" autocomplete="off" value="${String(tmp.tasa.toFixed(4)).replace('.', ',')}">
    <p class="nota-form" style="margin:6px 0 0">${t('tasaAyuda', 1 + ' ' + tmp.moneda, tmp.tasa.toFixed(4).replace('.', ','), gr.moneda)}</p>
  </div>`;
}

function htmlZonaItems() {
  if (!tmp.itemsDetectados || !tmp.itemsDetectados.length) return '';
  const sel = tmp.itemsSeleccion || new Set();
  const suma = [...sel].reduce((s, i) => s + tmp.itemsDetectados[i].importe, 0);
  return `<div class="carta" style="padding:13px;margin-bottom:15px">
    <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--bruma);margin-bottom:8px">${t('lineasDetectadas')}</div>
    <div style="max-height:180px;overflow-y:auto">
    ${tmp.itemsDetectados.map((it, i) => `
      <label style="display:flex;align-items:center;gap:9px;padding:5px 0;font-size:13.5px;cursor:pointer">
        <input type="checkbox" data-action-check="item-ticket" data-idx="${i}" ${sel.has(i) ? 'checked' : ''} style="width:17px;height:17px;accent-color:#6FF5C8">
        <span style="flex:1;color:var(--bruma);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.desc)}</span>
        <b style="font-family:var(--fuente-num);font-size:12.5px">${fmtMon(it.importe, tmp.moneda)}</b>
      </label>`).join('')}
    </div>
    <div class="chips" style="margin-top:9px">
      ${sel.size ? `<button type="button" data-action="usar-seleccion-ticket">${t('usarSeleccion', fmtMon(suma, tmp.moneda))}</button>` : ''}
      ${tmp.totalTicket ? `<button type="button" data-action="usar-total-ticket">${t('usarTotal', fmtMon(tmp.totalTicket, tmp.moneda))}</button>` : ''}
    </div>
  </div>`;
}

function htmlZonaReparto() {
  const parts = [...tmp.participantes];
  if (tmp.tipo === 'mitad') return `<p class="nota-form">${t('notaMitad')}</p>`;
  if (tmp.tipo === 'uno') {
    const quien = Object.keys(tmp.datos)[0] || parts[0];
    tmp.datos = { [quien]: 1 };
    return `<div class="campo"><label>${t('quienLoAsume')}</label>
      ${segPersonas('seg-deudor', parts, quien, 'elegir-deudor')}</div>
    <p class="nota-form">${t('notaUno')}</p>`;
  }
  const sufijo = tmp.tipo === 'porcentaje' ? '%' : tmp.tipo === 'cuotas' ? '×' : '';
  const filas = parts.map(pid => `
    <div class="campo" style="margin-bottom:9px">
      <label for="parte-${pid}">${t('parteDe', esc(nombre(pid)))} ${sufijo}</label>
      <input id="parte-${pid}" data-parte="${pid}" type="text" inputmode="decimal" placeholder="0" autocomplete="off"
        value="${valorParte(pid)}">
    </div>`).join('');
  const nota = tmp.tipo === 'exacto' ? t('notaExacto') : tmp.tipo === 'porcentaje' ? t('notaPorcentaje') : t('notaCuotas');
  return `<div class="fila-partes">${filas}</div><p class="nota-form">${nota}</p>`;
}
function valorParte(pid) {
  const v = tmp.datos[pid];
  if (v == null || v === 0) return '';
  if (tmp.tipo === 'exacto') return aDecimalMon(v, tmp.moneda);
  return String(v).replace('.', ',');
}

function guardarGasto() {
  const gr = grupo(tmp.grupoId);
  if (!gr) return;
  const importeOriginal = parseImporteMon($('#imp-gasto').value, tmp.moneda);
  if (!importeOriginal || importeOriginal <= 0) return errorForm(t('importeInvalido'));
  let tasa = 1, importe = importeOriginal;
  if (tmp.moneda !== gr.moneda) {
    const tEl = $('#tasa-gasto');
    tasa = tEl ? Number(String(tEl.value).replace(',', '.')) : tmp.tasa;
    if (!isFinite(tasa) || tasa <= 0) return errorForm(t('importeInvalido'));
    importe = convertir(importeOriginal, tmp.moneda, gr.moneda, tasa);
  }
  const parts = [...tmp.participantes].filter(p => gr.miembros.includes(p));
  if (!parts.length) return errorForm(t('eligeParticipantes'));

  // recolectar datos de reparto desde los inputs
  const datos = {};
  if (tmp.tipo === 'exacto' || tmp.tipo === 'porcentaje' || tmp.tipo === 'cuotas') {
    for (const pid of parts) {
      const el = $('#parte-' + pid);
      if (!el) continue;
      if (tmp.tipo === 'exacto') {
        const v = parseImporteMon(el.value || '0', gr.moneda);
        if (v == null || v < 0) return errorForm(t('rellenaPartes'));
        datos[pid] = v;
      } else {
        const v = Number(String(el.value || '0').replace(',', '.'));
        if (!isFinite(v) || v < 0) return errorForm(t('rellenaPartes'));
        datos[pid] = v;
      }
    }
  } else if (tmp.tipo === 'uno') {
    Object.assign(datos, tmp.datos);
  }

  const partes = calcularPartes(tmp.tipo, parts, datos, importe, tmp.pagadoPor);
  if (!partes) {
    if (tmp.tipo === 'exacto') {
      const suma = parts.reduce((s, p) => s + (datos[p] || 0), 0);
      return errorForm(t('partesNoSuman', fmtMon(suma, gr.moneda), fmtMon(importe, gr.moneda)));
    }
    if (tmp.tipo === 'porcentaje') {
      const suma = parts.reduce((s, p) => s + (datos[p] || 0), 0);
      return errorForm(t('pctNoSuma', String(Math.round(suma * 100) / 100)));
    }
    return errorForm(t('rellenaPartes'));
  }

  const desc = $('#desc-gasto').value.trim() || nombreCategoria(tmp.categoria);
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test($('#fecha-gasto').value) ? $('#fecha-gasto').value : hoyISO();
  const reparto = { tipo: tmp.tipo, participantes: parts, datos };
  const base = {
    grupoId: gr.id, desc, importe, moneda: tmp.moneda, importeOriginal, tasa,
    pagadoPor: tmp.pagadoPor, partes, reparto, categoria: tmp.categoria, fecha,
    items: (tmp.items || []).slice(0, 60), mod: ahora()
  };

  if (tmp.editando) {
    const g = estado.gastos.find(x => x.id === tmp.editando);
    if (g) Object.assign(g, base);
    toast(t('gastoActualizado'));
  } else {
    estado.gastos.push(Object.assign({ id: uid() }, base));
    toast(t('gastoAnadido'));
    const chk = $('#chk-recurrente');
    if (chk && chk.checked) {
      estado.recurrentes.push({
        id: uid(), grupoId: gr.id,
        plantilla: { desc, importe, categoria: tmp.categoria, pagadoPor: tmp.pagadoPor, partes: Object.assign({}, partes), reparto },
        frecuencia: tmp.frecuencia, proxima: sumarFrecuencia(fecha, tmp.frecuencia), activo: true, mod: ahora()
      });
      toast(t('recurrenteCreado', t(tmp.frecuencia).toLowerCase()));
    }
  }
  gr.repartoDef = { tipo: tmp.tipo, participantes: parts, datos };
  gr.mod = ahora();
  guardar(); vibrar(12); cerrarSheet(); render();
}

/* ---------- hoja: detalle gasto ---------- */
function sheetDetalleGasto(g) {
  const gr = grupo(g.grupoId) || grupoPareja();
  abrirSheet(`
    <h3 class="sheet-titulo">${g.categoria} ${esc(g.desc)}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="detalle-filas">
      <div class="detalle-fila"><span>${t('importe')}</span><b class="num">${fmtMon(g.importe, gr.moneda)}${g.moneda !== gr.moneda ? ' · ' + fmtMon(g.importeOriginal, g.moneda) : ''}</b></div>
      <div class="detalle-fila"><span>${t('pago', '')}</span><b>${emojiDe(g.pagadoPor)} ${esc(nombre(g.pagadoPor))}</b></div>
      <div class="detalle-fila"><span>${t('reparto')}</span><b>${etiquetaReparto(g)}</b></div>
      ${Object.entries(g.partes).map(([pid, parte]) => `
        <div class="detalle-fila"><span>· ${emojiDe(pid)} ${esc(nombre(pid))}</span><b class="num">${fmtMon(parte, gr.moneda)}</b></div>`).join('')}
      <div class="detalle-fila"><span>${t('fecha')}</span><b>${fechaBonita(g.fecha)}</b></div>
      <div class="detalle-fila"><span>${t('categoria')}</span><b>${g.categoria} ${nombreCategoria(g.categoria)}</b></div>
      ${gr.id !== 'pareja' ? `<div class="detalle-fila"><span>${t('grupo')}</span><b>${gr.emoji} ${esc(nombreGrupo(gr))}</b></div>` : ''}
      ${g.items && g.items.length ? `<div class="detalle-fila"><span>${t('recibo')}</span><b>${t('articulos', g.items.length)}</b></div>` : ''}
    </div>
    ${g.items && g.items.length ? g.items.map(it => `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--bruma);padding:2px 6px">
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.desc)}</span>
        <b style="font-family:var(--fuente-num)">${fmtMon(it.importe, g.moneda)}</b>
      </div>`).join('') : ''}
    <div class="acciones-sheet">
      <button class="btn-suave btn-peligro" data-action="eliminar-gasto" data-id="${g.id}">${t('eliminar')}</button>
      <button class="btn-principal" data-action="editar-gasto" data-id="${g.id}">${t('editar')}</button>
    </div>
  `);
}

/* ---------- hoja: saldar ---------- */
function sheetSaldar(grupoId) {
  const gr = grupo(grupoId) || grupoPareja();
  const transferencias = simplificarDeudas(netosGrupo(gr.id));
  if (!transferencias.length) { toast(t('sinDeudas')); return; }
  tmp = { grupoId: gr.id, metodo: 'efectivo' };

  if (gr.miembros.length === 2 && transferencias.length === 1) {
    const tr = transferencias[0];
    tmp.de = tr.de; tmp.para = tr.para; tmp.max = tr.importe;
    const linkPaypal = estado.ajustes.paypal
      ? `<a class="btn-suave btn-bloque" style="margin-bottom:12px;text-decoration:none" target="_blank" rel="noopener"
           href="https://paypal.me/${encodeURIComponent(estado.ajustes.paypal)}/${(tr.importe / factorMoneda(gr.moneda)).toFixed(digitosMoneda(gr.moneda))}${esc(gr.moneda)}">${t('abrirPaypal', esc(estado.ajustes.paypal))}</a>` : '';
    abrirSheet(`
      <h3 class="sheet-titulo">${t('saldarCuentas')}
        <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
      </h3>
      <p style="color:var(--bruma);font-size:14.5px;margin-bottom:16px">
        ${emojiDe(tr.de)} ${t('pagaA', '<b style="color:var(--nieve)">' + esc(nombre(tr.de)) + '</b>', '<b style="color:var(--nieve)">' + esc(nombre(tr.para)) + '</b>')} ${emojiDe(tr.para)}
      </p>
      <div class="campo campo-importe">
        <label for="imp-saldo">${t('importe')}</label>
        <input id="imp-saldo" type="text" inputmode="decimal" autocomplete="off" value="${aDecimalMon(tr.importe, gr.moneda)}">
      </div>
      <p class="nota-form">${t('ajustaParcial')}</p>
      <div class="campo"><label>${t('metodoPago')}</label>
        <div class="chips">${METODOS_PAGO().map(m => `<button type="button" data-action="elegir-metodo" data-valor="${m[0]}" class="${m[0] === 'efectivo' ? 'activo' : ''}">${m[1]}</button>`).join('')}</div>
      </div>
      ${linkPaypal}
      <p class="error-form" id="error-form" hidden></p>
      <button class="btn-principal btn-bloque" data-action="confirmar-saldar">${t('registrarPago')}</button>
    `);
  } else {
    abrirSheet(`
      <h3 class="sheet-titulo">${t('saldarCuentas')}
        <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
      </h3>
      <div class="subtitulo" style="margin-top:0">${t('planOptimo', transferencias.length)} ✨</div>
      ${transferencias.map((tr, i) => `
        <div class="item-linea">
          <span class="item-icono">${emojiDe(tr.de)}</span>
          <span class="item-cuerpo">
            <span class="item-titulo">${esc(nombre(tr.de))} → ${esc(nombre(tr.para))}</span>
            <span class="item-sub">${fmtMon(tr.importe, gr.moneda)}</span>
          </span>
          <button class="btn-suave" data-action="registrar-transferencia" data-idx="${i}">${t('registrar')}</button>
        </div>`).join('')}
      <div class="campo" style="margin-top:14px"><label>${t('metodoPago')}</label>
        <div class="chips">${METODOS_PAGO().map(m => `<button type="button" data-action="elegir-metodo" data-valor="${m[0]}" class="${m[0] === 'efectivo' ? 'activo' : ''}">${m[1]}</button>`).join('')}</div>
      </div>
    `);
    tmp.transferencias = transferencias;
  }
}

function confirmarSaldar() {
  const gr = grupo(tmp.grupoId);
  const imp = parseImporteMon($('#imp-saldo').value, gr.moneda);
  if (!imp || imp <= 0) return errorForm(t('importeInvalido'));
  if (imp > tmp.max) return errorForm(t('deudaEs', fmtMon(tmp.max, gr.moneda)));
  estado.pagos.push({ id: uid(), grupoId: gr.id, de: tmp.de, para: tmp.para, importe: imp, metodo: tmp.metodo, fecha: hoyISO(), mod: ahora() });
  guardar(); vibrar(12); cerrarSheet(); render();
  toast(imp === tmp.max ? t('pazTotal') : t('pagoRegistrado'));
}

/* ---------- hoja: totales ---------- */
function sheetTotales() {
  const gr = grupo(grupoActivo) || grupoPareja();
  const tot = totalesGrupo(gr.id);
  const filasPersona = Object.keys(tot.porPersona).length || Object.keys(tot.parteJusta).length
    ? [...new Set([...Object.keys(tot.porPersona), ...Object.keys(tot.parteJusta)])].map(pid => `
      <div class="detalle-fila"><span>${emojiDe(pid)} ${esc(nombre(pid))}</span>
        <b class="num">${fmtMon(tot.porPersona[pid] || 0, gr.moneda)} <small style="color:var(--bruma);font-family:var(--fuente-texto)">· ${t('parteJusta').toLowerCase()}: ${fmtMon(tot.parteJusta[pid] || 0, gr.moneda)}</small></b>
      </div>`).join('') : '';
  abrirSheet(`
    <h3 class="sheet-titulo">${t('totalesTitulo', esc(nombreGrupo(gr)))}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="fila-stats" style="margin:0 0 14px">
      <div class="stat menta"><div class="stat-etq">${t('esteMes')}</div><div class="stat-num">${fmtMon(tot.mesActual, gr.moneda)}</div></div>
      <div class="stat"><div class="stat-etq">${t('mesAnterior')}</div><div class="stat-num">${fmtMon(tot.mesPrevio, gr.moneda)}</div></div>
    </div>
    <div class="carta" style="text-align:center;padding:18px;margin-bottom:14px">
      <div class="stat-etq">📅 Total de ${tot.anoActual}</div>
      <div class="stat-num tinta-menta" style="font-size:26px;margin-top:4px">${fmtMon(tot.totalAnual, gr.moneda)}</div>
      <div style="font-size:12px;color:var(--bruma);margin-top:4px">Se mantiene aunque saldéis las cuentas — nada se borra nunca.</div>
    </div>
    ${Object.keys(tot.porAno).filter(a => a !== tot.anoActual).length ? `
    <div class="detalle-filas" style="margin-bottom:14px">
      ${Object.entries(tot.porAno).filter(([a]) => a !== tot.anoActual).sort((a, b) => b[0].localeCompare(a[0])).map(([a, v]) => `
        <div class="detalle-fila"><span>📅 ${a}</span><b class="num">${fmtMon(v, gr.moneda)}</b></div>`).join('')}
    </div>` : ''}
    <div class="subtitulo" style="margin-top:0">${t('evolucion')}</div>
    <div class="carta" style="padding:14px">${graficoBarrasMeses(tot.porMes, gr.moneda)}</div>
    <div class="subtitulo">${t('porCategoria')}</div>
    <div class="carta" style="padding:14px">${graficoDonutCategorias(tot.porCategoria, gr.moneda, nombreCategoria) || '<p style="color:var(--bruma);font-size:14px">—</p>'}</div>
    <div class="subtitulo">${t('porPersona')}</div>
    <div class="detalle-filas">${filasPersona || ''}
      <div class="detalle-fila"><span><b>${t('total')}</b></span><b class="num tinta-menta">${fmtMon(tot.total, gr.moneda)}</b></div>
    </div>
  `);
}

/* ---------- hoja: recurrentes ---------- */
function sheetRecurrentes() {
  const lista = estado.recurrentes.filter(r => grupo(r.grupoId));
  abrirSheet(`
    <h3 class="sheet-titulo">${t('recurrentesTitulo')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    ${!lista.length ? `<p style="color:var(--bruma);font-size:14.5px">${t('sinRecurrentes')}</p>` : lista.map(r => `
      <div class="item-linea">
        <span class="item-icono">${r.plantilla.categoria}</span>
        <span class="item-cuerpo">
          <span class="item-titulo">${esc(r.plantilla.desc)} · ${fmtMon(r.plantilla.importe, (grupo(r.grupoId) || {}).moneda || 'EUR')}</span>
          <span class="item-sub">${t(r.frecuencia)} · ${r.activo ? t('proxima', fechaBonita(r.proxima)) : '⏸️'}</span>
        </span>
        <button class="btn-suave" data-action="alternar-recurrente" data-id="${r.id}">${r.activo ? t('pausar') : t('reanudar')}</button>
        <button class="btn-icono" data-action="eliminar-recurrente" data-id="${r.id}" aria-label="🗑">🗑️</button>
      </div>`).join('')}
  `);
}

/* ---------- hoja: CSV ---------- */
function sheetCSV() {
  csvFilas = null;
  const gr = grupo(grupoActivo) || grupoPareja();
  tmp = { grupoId: gr.id, pagadoPor: gr.miembros[0] };
  abrirSheet(`
    <h3 class="sheet-titulo">${t('csvTitulo')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <p class="nota-form">${t('csvAyuda')}</p>
    <button class="btn-suave btn-bloque" data-action="elegir-csv">${t('csvElegir')}</button>
    <div id="csv-vista" style="margin-top:14px"></div>
    <input type="file" id="archivo-csv" accept=".csv,text/csv,text/plain" hidden>
  `);
}
function pintarVistaCSV() {
  const zona = $('#csv-vista');
  if (!zona) return;
  if (!csvFilas || !csvFilas.length) { zona.innerHTML = `<p class="error-form">${t('csvVacio')}</p>`; return; }
  const gr = grupo(tmp.grupoId);
  zona.innerHTML = `
    <div class="subtitulo" style="margin-top:0">${t('csvVista', csvFilas.length)}</div>
    ${csvFilas.slice(0, 5).map(f => `
      <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--bruma);padding:3px 2px">
        <span>${fechaBonita(f.fecha)}</span>
        <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.desc)}</span>
        <b style="font-family:var(--fuente-num)">${fmtMon(f.importe, gr.moneda)}</b>
      </div>`).join('')}
    ${csvFilas.length > 5 ? `<p style="color:var(--bruma);font-size:12px;text-align:center">… +${csvFilas.length - 5}</p>` : ''}
    <div class="campo" style="margin-top:12px"><label>${t('quienPago')}</label>${segPersonas('seg-csv-pagador', gr.miembros, tmp.pagadoPor, 'elegir-csv-pagador')}</div>
    <button class="btn-principal btn-bloque" data-action="importar-csv-confirmar">${t('csvImportar', csvFilas.length)}</button>`;
}
function importarCSVConfirmar() {
  const gr = grupo(tmp.grupoId);
  if (!gr || !csvFilas) return;
  for (const f of csvFilas) {
    const partes = calcularPartes('mitad', gr.miembros, {}, f.importe, tmp.pagadoPor);
    estado.gastos.push({
      id: uid(), grupoId: gr.id, desc: f.desc, importe: f.importe, moneda: gr.moneda,
      importeOriginal: f.importe, tasa: 1, pagadoPor: tmp.pagadoPor, partes,
      reparto: { tipo: 'mitad', participantes: gr.miembros.slice(), datos: {} },
      categoria: '📦', fecha: f.fecha, items: [], mod: ahora()
    });
  }
  const n = csvFilas.length;
  csvFilas = null;
  guardar(); cerrarSheet(); render();
  toast(t('csvImportado', n));
}

/* ---------- hoja: grupo (crear / editar) ---------- */
function sheetGrupo(g) {
  tmp = {
    editando: g ? g.id : null,
    emoji: g ? g.emoji : '🏔️',
    miembros: new Set(g ? g.miembros : ['a', 'b'])
  };
  const esPareja = g && g.id === 'pareja';
  abrirSheet(`
    <h3 class="sheet-titulo">${g ? t('editarGrupo') : t('nuevoGrupo').replace('＋ ', '')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    ${esPareja ? '' : `<div class="campo">
      <label for="nombre-grupo">${t('nombreGrupo')}</label>
      <input id="nombre-grupo" type="text" maxlength="30" autocomplete="off" value="${g ? esc(g.nombre) : ''}">
    </div>
    <div class="campo"><label>${t('emoji')}</label>
      <div class="chips">${EMOJIS_GRUPO.map(e => `<button type="button" data-action="elegir-emoji-grupo" data-valor="${e}" class="${e === tmp.emoji ? 'activo' : ''}">${e}</button>`).join('')}</div>
    </div>`}
    <div class="campo"><label>${t('monedaBase')}</label>
      <select id="moneda-grupo">${LISTA_MONEDAS.map(m => `<option value="${m}" ${m === (g ? g.moneda : monedaPareja()) ? 'selected' : ''}>${m} — ${esc(nombreMoneda(m))}</option>`).join('')}</select>
    </div>
    ${esPareja ? '' : `<div class="campo"><label>${t('miembros')}</label>
      <div class="chips" id="chips-miembros">
        ${estado.personas.map(p => `<button type="button" data-action="alternar-miembro" data-valor="${p.id}" class="${tmp.miembros.has(p.id) ? 'activo' : ''}" ${g && (p.id === 'a' || p.id === 'b') && g.id === 'pareja' ? 'disabled' : ''}>${p.emoji} ${esc(p.nombre)}</button>`).join('')}
      </div>
    </div>
    <div class="campo">
      <label for="nuevo-amigo">${t('nuevoAmigo')}</label>
      <div style="display:flex;gap:8px">
        <input id="nuevo-amigo" type="text" maxlength="20" placeholder="${t('nombreAmigo')}" autocomplete="off" style="flex:1">
        <button class="btn-suave" data-action="crear-amigo">＋</button>
      </div>
    </div>`}
    <p class="error-form" id="error-form" hidden></p>
    <div class="acciones-sheet">
      ${g && !esPareja ? `<button class="btn-suave btn-peligro" data-action="eliminar-grupo" data-id="${g.id}">🗑️</button>` : ''}
      <button class="btn-principal" data-action="guardar-grupo">${g ? t('guardarCambios') : t('grupoCreado').replace(' 🎉', '') + ' ✓'}</button>
    </div>
  `);
}

function guardarGrupo() {
  const esPareja = tmp.editando === 'pareja';
  const moneda = $('#moneda-grupo') ? $('#moneda-grupo').value : 'EUR';
  if (esPareja) {
    const gr = grupoPareja();
    gr.moneda = sMoneda(moneda);
    gr.mod = ahora();
    estado.ajustes.moneda = gr.moneda;
    estado.ajustes.mod = ahora();
    guardar(); cerrarSheet(); render();
    toast(t('grupoGuardado'));
    return;
  }
  const nom = $('#nombre-grupo').value.trim();
  if (!nom) return errorForm(t('nombreObligatorio'));
  const miembros = [...tmp.miembros];
  if (miembros.length < 2) return errorForm(t('minDosMiembros'));
  if (tmp.editando) {
    const gr = grupo(tmp.editando);
    if (gr) Object.assign(gr, { nombre: nom, emoji: tmp.emoji, miembros, moneda: sMoneda(moneda), mod: ahora() });
    toast(t('grupoGuardado'));
  } else {
    const id = uid();
    estado.grupos.push({ id, nombre: nom, emoji: tmp.emoji, miembros, moneda: sMoneda(moneda), repartoDef: null, mod: ahora() });
    grupoActivo = id;
    toast(t('grupoCreado'));
  }
  guardar(); cerrarSheet(); render();
}

/* ---------- hoja: meta ---------- */
function sheetMeta(o) {
  tmp = { editando: o ? o.id : null, emoji: o ? o.emoji : '⛷️' };
  abrirSheet(`
    <h3 class="sheet-titulo">${o ? t('editar') + ' 🎯' : t('crearMeta')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    ${o ? '' : `<div class="campo"><label>${t('ideasRapidas')}</label><div class="chips">
      ${SUGERENCIAS_META().map((s, i) => `<button type="button" data-action="sugerencia-meta" data-idx="${i}">${s.emoji} ${esc(s.nombre)}</button>`).join('')}
    </div></div>`}
    <div class="campo">
      <label for="nombre-meta">${t('nombreMeta')}</label>
      <input id="nombre-meta" type="text" maxlength="40" placeholder="${esc(t('sugNieve'))}" autocomplete="off" value="${o ? esc(o.nombre) : ''}">
    </div>
    <div class="campo"><label>${t('emoji')}</label>
      <div class="chips" id="chips-emoji-meta">
        ${EMOJIS_META.map(e => `<button type="button" data-action="elegir-emoji-meta" data-valor="${e}" class="${e === tmp.emoji ? 'activo' : ''}">${e}</button>`).join('')}
      </div>
    </div>
    <div class="fila-2">
      <div class="campo">
        <label for="imp-meta">${t('objetivo')}</label>
        <input id="imp-meta" type="text" inputmode="decimal" placeholder="900" autocomplete="off" value="${o ? aDecimal(o.meta) : ''}">
      </div>
      <div class="campo">
        <label for="fecha-meta">${t('fechaLimite')}</label>
        <input id="fecha-meta" type="date" value="${o && o.fechaLimite ? o.fechaLimite : ''}">
      </div>
    </div>
    <p class="error-form" id="error-form" hidden></p>
    <div class="acciones-sheet">
      ${o ? `<button class="btn-suave btn-peligro" data-action="eliminar-meta" data-id="${o.id}">🗑️</button>` : ''}
      <button class="btn-principal" data-action="guardar-meta">${o ? t('guardarCambios') : t('crearMeta') + ' ✓'}</button>
    </div>
  `);
}

function guardarMeta() {
  const nom = $('#nombre-meta').value.trim();
  if (!nom) return errorForm(t('nombreMetaFalta'));
  const meta = parseImporte($('#imp-meta').value);
  if (!meta || meta <= 0) return errorForm(t('importeMetaFalta'));
  const fechaLimite = /^\d{4}-\d{2}-\d{2}$/.test($('#fecha-meta').value) ? $('#fecha-meta').value : null;
  if (tmp.editando) {
    const o = estado.objetivos.find(x => x.id === tmp.editando);
    if (o) {
      Object.assign(o, { nombre: nom, emoji: tmp.emoji, meta, fechaLimite, mod: ahora() });
      const ap = aportadoMeta(o);
      if (o.completadoEl && ap < meta) o.completadoEl = null;
      if (!o.completadoEl && ap >= meta) { guardar(); cerrarSheet(); celebrarMeta(o); return; }
    }
    toast(t('metaActualizada'));
  } else {
    estado.objetivos.push({ id: uid(), nombre: nom, emoji: tmp.emoji, meta, fechaLimite, aportes: [], completadoEl: null, mod: ahora() });
    toast(t('metaCreada'));
  }
  guardar(); vibrar(12); cerrarSheet(); render();
}

function sheetDetalleMeta(o) {
  const ap = aportadoMeta(o);
  const restante = Math.max(0, o.meta - ap);
  const pct = o.meta > 0 ? Math.min(100, ap / o.meta * 100) : 0;
  const aportes = [...o.aportes].sort((x, y) => String(y.creadoEl || '').localeCompare(String(x.creadoEl || ''))).slice(0, 12);
  abrirSheet(`
    <h3 class="sheet-titulo">${o.emoji} ${esc(o.nombre)}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="barra ${o.completadoEl ? 'oro' : ''}" style="margin-bottom:8px"><i style="width:${pct}%"></i></div>
    <div class="detalle-filas">
      <div class="detalle-fila"><span>${t('ahorrado')}</span><b class="num tinta-menta">${fmt(ap)}</b></div>
      <div class="detalle-fila"><span>${t('objetivo')}</span><b class="num">${fmt(o.meta)}</b></div>
      <div class="detalle-fila"><span>${t('falta')}</span><b class="num ${restante === 0 ? 'tinta-oro' : ''}">${restante === 0 ? t('nadaFalta') : fmt(restante)}</b></div>
      <div class="detalle-fila"><span>${emojiDe('a')} ${esc(nombre('a'))}</span><b class="num tinta-menta">${fmt(aportadoMetaDe(o, 'a'))}</b></div>
      <div class="detalle-fila"><span>${emojiDe('b')} ${esc(nombre('b'))}</span><b class="num tinta-coral">${fmt(aportadoMetaDe(o, 'b'))}</b></div>
      ${o.fechaLimite ? `<div class="detalle-fila"><span>${t('fechaLimite').replace(' (opcional)', '').replace(' (optional)', '')}</span><b>${fechaBonita(o.fechaLimite)}</b></div>` : ''}
    </div>
    ${aportes.length ? `<div class="subtitulo" style="margin-top:4px">${t('ultimosAportes')}</div>` + aportes.map(a => `
      <div class="item-linea">
        <span class="item-icono">${emojiDe(a.miembro)}</span>
        <span class="item-cuerpo"><span class="item-titulo">${esc(nombre(a.miembro))}</span>
          <span class="item-sub">${a.origen ? '«' + esc(a.origen) + '» · ' : ''}${fechaBonita(a.fecha)}</span></span>
        <span class="item-importe tinta-menta">+${fmt(a.importe)}</span>
      </div>`).join('') : ''}
    <div class="acciones-sheet">
      <button class="btn-suave" data-action="editar-meta" data-id="${o.id}">✏️</button>
      ${!o.completadoEl ? `<button class="btn-principal" data-action="abrir-aporte" data-id="${o.id}">${t('aportarA').split(' ')[0]} ${t('aportar').replace('＋ ', '')}</button>`
        : `<span class="insignia-completada" style="flex:1;justify-content:center;padding:12px">${t('metaConseguidaSheet')}</span>`}
    </div>
  `);
}

function sheetAporte(o) {
  tmp = { metaId: o.id, miembro: 'a' };
  const restante = Math.max(0, o.meta - aportadoMeta(o));
  abrirSheet(`
    <h3 class="sheet-titulo">${t('aportarA')} ${o.emoji} ${esc(o.nombre)}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="campo"><label>${t('quienAporta')}</label>${segPersonas('seg-aporta', ['a', 'b'], 'a', 'elegir-aportador')}</div>
    <div class="campo campo-importe">
      <label for="imp-aporte">${t('importe')}</label>
      <input id="imp-aporte" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off">
    </div>
    <div class="campo"><div class="chips">
      ${[500, 1000, 2000, 5000].map(c => `<button type="button" data-action="importe-rapido" data-valor="${c}">+${fmt(c).replace(/[.,]00/, '')}</button>`).join('')}
      ${restante > 0 ? `<button type="button" data-action="importe-rapido" data-valor="${restante}">${t('loQueFalta', fmt(restante))}</button>` : ''}
    </div></div>
    <p class="error-form" id="error-form" hidden></p>
    <button class="btn-principal btn-bloque" data-action="guardar-aporte">${t('aportar').replace('＋ ', '')} ✓</button>
  `);
  setTimeout(() => { const el = $('#imp-aporte'); if (el) el.focus(); }, 350);
}

function guardarAporte() {
  const o = estado.objetivos.find(x => x.id === tmp.metaId);
  if (!o) return;
  const imp = parseImporte($('#imp-aporte').value);
  if (!imp || imp <= 0) return errorForm(t('importeInvalido'));
  o.aportes.push({ id: uid(), miembro: tmp.miembro, importe: imp, fecha: hoyISO(), origen: null, creadoEl: ahora() });
  o.mod = ahora();
  const lograda = !o.completadoEl && aportadoMeta(o) >= o.meta;
  guardar(); vibrar(12); cerrarSheet(); render();
  if (lograda) celebrarMeta(o);
  else toast(t('aporteHecho', fmt(imp), o.nombre));
}

function celebrarMeta(o) {
  o.completadoEl = ahora();
  o.mod = ahora();
  guardar(); render();
  confeti();
  vibrar([40, 60, 40, 60, 120]);
  toast(t('metaConseguida', o.emoji + ' ' + o.nombre));
}

/* ---------- hoja: reto ---------- */
function sheetReto(plantilla) {
  tmp = { emoji: plantilla ? plantilla.emoji : '✨', modo: plantilla ? plantilla.modo : 'fijo' };
  const metasActivas = estado.objetivos.filter(o => !o.completadoEl);
  abrirSheet(`
    <h3 class="sheet-titulo">${t('nuevoReto')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="campo">
      <label for="nombre-reto">${t('nombreReto')}</label>
      <input id="nombre-reto" type="text" maxlength="40" autocomplete="off" value="${plantilla ? esc(plantilla.nombre) : ''}">
    </div>
    <div class="campo"><label>${t('emoji')}</label>
      <div class="chips" id="chips-emoji-reto">
        ${EMOJIS_RETO.map(e => `<button type="button" data-action="elegir-emoji-reto" data-valor="${e}" class="${e === tmp.emoji ? 'activo' : ''}">${e}</button>`).join('')}
      </div>
    </div>
    <div class="fila-2">
      <div class="campo">
        <label for="imp-reto">${t('porCheck', monedaPareja())}</label>
        <input id="imp-reto" type="text" inputmode="decimal" placeholder="2,50" autocomplete="off" value="${plantilla ? aDecimal(plantilla.importe) : ''}">
      </div>
      <div class="campo">
        <label for="checks-reto">${t('numChecks')}</label>
        <input id="checks-reto" type="number" min="1" max="200" inputmode="numeric" placeholder="14" value="${plantilla ? plantilla.checks : ''}">
      </div>
    </div>
    <div class="campo"><label>${t('modo')}</label>
      ${segmento('seg-modo', [['fijo', t('fijo')], ['creciente', t('creciente')]], tmp.modo, 'elegir-modo')}
    </div>
    <p class="nota-form">${t('notaModo')}</p>
    <div class="campo">
      <label for="meta-reto">${t('paraQueMeta')}</label>
      <select id="meta-reto">
        <option value="">${t('huchaLibre')}</option>
        ${metasActivas.map(o => `<option value="${o.id}">${o.emoji} ${esc(o.nombre)}</option>`).join('')}
      </select>
    </div>
    <p class="nota-form">${t('notaDestino')}</p>
    <p class="error-form" id="error-form" hidden></p>
    <button class="btn-principal btn-bloque" data-action="guardar-reto">${t('empezarRetoBtn')}</button>
  `);
}

function guardarReto() {
  const nom = $('#nombre-reto').value.trim();
  if (!nom) return errorForm(t('nombreRetoFalta'));
  const imp = parseImporte($('#imp-reto').value);
  if (!imp || imp <= 0) return errorForm(t('importeCheckFalta'));
  const checks = parseInt($('#checks-reto').value, 10);
  if (!checks || checks < 1 || checks > 200) return errorForm(t('checksRango'));
  const objetivoId = $('#meta-reto').value || null;
  estado.retos.push({
    id: uid(), nombre: nom, emoji: tmp.emoji, importePorCheck: imp, checksMeta: checks,
    modo: tmp.modo, checks: [], objetivoId, estado: 'activo', finalizadoEl: null, mod: ahora()
  });
  guardar(); vibrar(12); cerrarSheet(); vistaActual = 'retos'; render();
  toast(t('retoEnMarcha'));
}

function sheetDetalleReto(r) {
  const meta = r.objetivoId ? estado.objetivos.find(o => o.id === r.objetivoId) : null;
  const listo = r.checks.length >= r.checksMeta;
  abrirSheet(`
    <h3 class="sheet-titulo">${r.emoji} ${esc(r.nombre)}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    ${htmlChecksGrid(r)}
    <div class="detalle-filas" style="margin-top:14px">
      <div class="detalle-fila"><span>${t('progreso')}</span><b class="num">${r.checks.length} / ${r.checksMeta}</b></div>
      <div class="detalle-fila"><span>${t('ahorrado')}</span><b class="num tinta-menta">${fmt(ahorroReto(r))}</b></div>
      <div class="detalle-fila"><span>${t('metaDelReto')}</span><b class="num">${fmt(metaAhorroReto(r))}</b></div>
      <div class="detalle-fila"><span>${emojiDe('a')} ${esc(nombre('a'))}</span><b class="num tinta-menta">${fmt(ahorroRetoDe(r, 'a'))}</b></div>
      <div class="detalle-fila"><span>${emojiDe('b')} ${esc(nombre('b'))}</span><b class="num tinta-coral">${fmt(ahorroRetoDe(r, 'b'))}</b></div>
      <div class="detalle-fila"><span>${t('destino')}</span><b>${meta ? meta.emoji + ' ' + esc(meta.nombre) : t('huchaLibre')}</b></div>
      ${r.modo === 'creciente' && !listo ? `<div class="detalle-fila"><span>${t('proximoCheck')}</span><b class="num">${fmt(importeCheck(r, r.checks.length + 1))}</b></div>` : ''}
    </div>
    ${r.estado === 'activo' ? `
      ${listo
        ? `<button class="btn-principal btn-bloque" data-action="completar-reto" data-id="${r.id}">${t('completarReto')}</button>`
        : `<div class="acciones-sheet" style="margin-top:0">
            <button class="btn-suave" style="flex:1" data-action="checkin" data-id="${r.id}" data-miembro="a" ${yaCheckeoHoy(r, 'a') ? 'disabled' : ''}>${yaCheckeoHoy(r, 'a') ? t('hechoHoy') : t('checkDe', esc(nombre('a')))}</button>
            <button class="btn-suave" style="flex:1" data-action="checkin" data-id="${r.id}" data-miembro="b" ${yaCheckeoHoy(r, 'b') ? 'disabled' : ''}>${yaCheckeoHoy(r, 'b') ? t('hechoHoy') : t('checkDe', esc(nombre('b')))}</button>
          </div>`}
      <button class="btn-suave btn-peligro btn-bloque" style="margin-top:10px" data-action="abandonar-reto" data-id="${r.id}">${t('abandonarReto')}</button>
    ` : ''}
  `);
}

function hacerCheckin(id, miembro) {
  const r = estado.retos.find(x => x.id === id);
  if (!r || r.estado !== 'activo') return;
  if (yaCheckeoHoy(r, miembro)) { toast(t('yaCheckeo', nombre(miembro))); return; }
  if (r.checks.length >= r.checksMeta) { toast(t('retoCompleto')); return; }
  r.checks.push({ fecha: hoyISO(), miembro });
  r.mod = ahora();
  guardar(); vibrar(20);
  const completo = r.checks.length >= r.checksMeta;
  render();
  if (!$('#velo').hidden) sheetDetalleReto(r);
  toast(completo ? t('ultimoCheck') : t('checkHecho', fmt(importeCheck(r, r.checks.length)), rachaDias()));
}

function completarReto(id) {
  const r = estado.retos.find(x => x.id === id);
  if (!r || r.estado !== 'activo') return;
  const total = ahorroReto(r);
  r.estado = 'completado';
  r.finalizadoEl = ahora();
  r.mod = ahora();
  const meta = r.objetivoId ? estado.objetivos.find(o => o.id === r.objetivoId) : null;
  if (meta) {
    for (const m of ['a', 'b']) {
      const parte = ahorroRetoDe(r, m);
      if (parte > 0) meta.aportes.push({ id: uid(), miembro: m, importe: parte, fecha: hoyISO(), origen: r.nombre, creadoEl: ahora() });
    }
    meta.mod = ahora();
  }
  guardar(); cerrarSheet(); render();
  confeti();
  vibrar([40, 60, 40, 60, 120]);
  if (meta && !meta.completadoEl && aportadoMeta(meta) >= meta.meta) celebrarMeta(meta);
  else toast(meta ? t('retoCompletadoMeta', fmt(total), meta.emoji + ' ' + meta.nombre) : t('retoCompletadoLibre', fmt(total)));
}

/* ---------- hoja: ajustes ---------- */
function sheetAjustes() {
  const salaTxt = disp.sala ? t('salaActiva', disp.sala) : t('sinSala');
  const permiso = ('Notification' in window) ? Notification.permission : 'no-soportado';
  const etiquetaAvisos = permiso === 'granted' ? 'Activados ✓'
    : permiso === 'denied' ? 'Bloqueados — actívalos desde los ajustes del navegador'
    : permiso === 'no-soportado' ? 'No disponible en este navegador'
    : 'Desactivados';
  abrirSheet(`
    <h3 class="sheet-titulo">${t('ajustes')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${emojiDe('a')} ${esc(nombre('a'))} + ${emojiDe('b')} ${esc(nombre('b'))}</b><span>${t('vosotrosDos')}</span></div>
      <button class="btn-suave" data-action="editar-pareja">✏️</button>
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>🔔 Avisos de la pareja</b><span>${etiquetaAvisos}</span></div>
      ${permiso === 'default' ? `<button class="btn-suave" data-action="activar-avisos">Activar</button>` : ''}
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${t('idioma')} 🌍</b></div>
      <select id="sel-idioma" class="select-mini">
        ${IDIOMAS.map(i => `<option value="${i[0]}" ${window.idiomaActual === i[0] ? 'selected' : ''}>${i[1]}</option>`).join('')}
      </select>
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${t('monedaAjuste')}</b><span>${esc(nombreMoneda(monedaPareja()))}</span></div>
      <select id="sel-moneda" class="select-mini">
        ${LISTA_MONEDAS.map(m => `<option value="${m}" ${monedaPareja() === m ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>🅿️ ${t('paypalUsuario')}</b></div>
      <input id="inp-paypal" type="text" maxlength="30" placeholder="usuario" value="${esc(estado.ajustes.paypal)}" class="select-mini" style="width:120px" autocomplete="off">
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>📡 ${t('sala')}</b><span>${esc(salaTxt)}</span></div>
      ${disp.sala
        ? `<button class="btn-suave btn-peligro" data-action="salir-sala">${t('salirSala')}</button>`
        : `<button class="btn-suave" data-action="sala-desde-ajustes">➕</button>`}
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${t('copiaSeguridad')}</b><span>${t('copiaDesc')}</span></div>
      <button class="btn-suave" data-action="exportar-datos">${t('exportar')}</button>
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${t('restaurarCopia')}</b><span>${t('restaurarDesc')}</span></div>
      <button class="btn-suave" data-action="importar-datos">${t('importar')}</button>
    </div>
    <div class="ajuste-fila">
      <div class="aj-texto"><b>${t('empezarDeCero')}</b><span>${t('borrarDesc')}</span></div>
      <button class="btn-suave btn-peligro" data-action="borrar-todo">${t('borrar')}</button>
    </div>
    <p class="version-app">KOAPLIT v${VERSION_APP} · ${t('hechoCon')}</p>
  `);
}

function sheetEditarPareja() {
  const pa = persona('a'), pb = persona('b');
  abrirSheet(`
    <h3 class="sheet-titulo">${t('vosotros')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    <div class="campo-persona menta" style="margin-bottom:10px">
      <label for="edit-nombre-a">${t('persona1')}</label>
      <input id="edit-nombre-a" type="text" maxlength="20" value="${esc(pa.nombre)}">
      <div class="emojis" data-para="emoji-a">
        ${EMOJIS_PERSONA.map(e => `<button type="button" class="${pa.emoji === e ? 'activo' : ''}">${e}</button>`).join('')}
      </div>
    </div>
    <div class="campo-persona coral">
      <label for="edit-nombre-b">${t('persona2')}</label>
      <input id="edit-nombre-b" type="text" maxlength="20" value="${esc(pb.nombre)}">
      <div class="emojis" data-para="emoji-b">
        ${EMOJIS_PERSONA.map(e => `<button type="button" class="${pb.emoji === e ? 'activo' : ''}">${e}</button>`).join('')}
      </div>
    </div>
    <p class="error-form" id="error-form" hidden></p>
    <button class="btn-principal btn-bloque" style="margin-top:18px" data-action="guardar-pareja-edit">${t('guardado').replace(' ✓', '')} ✓</button>
  `);
}

function sheetConfirmar(titulo, texto, etiqueta, cb) {
  confirmCb = cb;
  abrirSheet(`
    <h3 class="sheet-titulo">${titulo}</h3>
    <p style="color:var(--bruma);font-size:15px;margin-bottom:20px">${texto}</p>
    <div class="acciones-sheet" style="margin-top:0">
      <button class="btn-suave" style="flex:1" data-action="cerrar-sheet">${t('mejorNo')}</button>
      <button class="btn-principal" style="flex:1;background:linear-gradient(115deg,#FF7B8A,#FF9A7B);box-shadow:0 10px 26px -10px rgba(255,123,138,.45)" data-action="confirmar-si">${etiqueta}</button>
    </div>
  `);
}

/* ---------- exportar / importar ---------- */
function exportarDatos() {
  const datos = JSON.stringify(estado, null, 2);
  const blob = new Blob([datos], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'koaplit-copia-' + hoyISO() + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
  toast(t('copiaExportada'));
}

function importarDatos(archivo) {
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const e = JSON.parse(lector.result);
      if (!e || typeof e !== 'object' || !('version' in e) || !('gastos' in e)) throw new Error('formato');
      sheetConfirmar(t('restaurarCopia'), t('seguroRestaurar'), t('siRestaurar'), () => {
        estado = sanearEstado(e);
        guardar(); render();
        toast(t('copiaRestaurada'));
      });
    } catch (_) {
      toast(t('archivoInvalido'));
    }
  };
  lector.readAsText(archivo);
}

/* ---------- OCR ---------- */
async function procesarTicket(archivo) {
  const btn = $('#btn-ocr');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = t('cargandoOCR');
  try {
    const res = await window.OCR.leerTicket(archivo, tmp.moneda, p => {
      if (btn.isConnected) btn.textContent = t('escaneando', p);
    });
    if (!btn.isConnected) return; // la hoja se cerró mientras tanto
    tmp.itemsDetectados = res.lineas;
    tmp.itemsSeleccion = new Set();
    tmp.totalTicket = res.total;
    if (res.total) {
      const imp = $('#imp-gasto');
      if (imp && !imp.value) imp.value = aDecimalMon(res.total, tmp.moneda);
      toast(t('ticketLeido', fmtMon(res.total, tmp.moneda)));
    } else {
      toast(t('ticketSinTotal'));
    }
    if (res.fecha) { const f = $('#fecha-gasto'); if (f) f.value = res.fecha; }
    tmp.items = res.lineas.slice(0, 60);
    const zona = $('#zona-items');
    if (zona) zona.innerHTML = htmlZonaItems();
  } catch (err) {
    toast(t('ticketError'));
  } finally {
    if (btn.isConnected) { btn.disabled = false; btn.textContent = t('escanearTicket'); }
  }
}

async function procesarPortadaMes(archivo) {
  const grupoId = tmp.portadaGrupoId, ym = tmp.portadaYm;
  if (!grupoId || !ym) return;
  toast('Preparando la foto… 🖼️');
  try {
    const dataUrl = await comprimirImagen(archivo);
    guardarPortadaMes(grupoId, ym, dataUrl, disp.yo);
    guardar(); render();
    toast('¡Foto puesta! 🖼️');
  } catch (_) {
    toast('No pude procesar esa foto 🙈');
  }
}

/* ============================================================
   ACCIONES
   ============================================================ */
const acciones = {
  'ir': b => { vistaActual = b.dataset.vista; busqueda = ''; cerrarSheet(); render(); window.scrollTo({ top: 0 }); },
  'fab': () => {
    if (vistaActual === 'metas') sheetMeta(null);
    else if (vistaActual === 'retos') sheetReto(null);
    else sheetGasto(null, vistaActual === 'gastos' ? grupoActivo : 'pareja');
  },
  'cerrar-sheet': () => cerrarSheet(),
  'abrir-ajustes': () => sheetAjustes(),

  // gastos
  'nuevo-gasto': b => sheetGasto(null, b.dataset.grupo || grupoActivo),
  'abrir-gasto': b => { const g = estado.gastos.find(x => x.id === b.dataset.id); if (g) sheetDetalleGasto(g); },
  'editar-gasto': b => { const g = estado.gastos.find(x => x.id === b.dataset.id); if (g) sheetGasto(g); },
  'guardar-gasto': () => guardarGasto(),
  'eliminar-gasto': b => {
    const id = b.dataset.id;
    sheetConfirmar(t('eliminarGasto'), t('seguroEliminarGasto'), t('siEliminar'), () => {
      estado.gastos = estado.gastos.filter(x => x.id !== id);
      marcarBorrado(id);
      guardar(); render(); toast(t('gastoEliminado'));
    });
  },
  'elegir-cat': b => { tmp.categoria = b.dataset.valor; marcarActivo(b); },
  'elegir-pagador': b => { tmp.pagadoPor = b.dataset.valor; marcarActivo(b); },
  'elegir-deudor': b => { tmp.datos = { [b.dataset.valor]: 1 }; marcarActivo(b); },
  'elegir-tipo': b => {
    tmp.tipo = b.dataset.valor; marcarActivo(b);
    const z = $('#zona-reparto');
    if (z) z.innerHTML = htmlZonaReparto();
  },
  'alternar-participante': b => {
    const pid = b.dataset.valor;
    if (tmp.participantes.has(pid)) { if (tmp.participantes.size > 1) tmp.participantes.delete(pid); }
    else tmp.participantes.add(pid);
    b.classList.toggle('activo', tmp.participantes.has(pid));
    const z = $('#zona-reparto');
    if (z) z.innerHTML = htmlZonaReparto();
  },
  'elegir-frecuencia': b => { tmp.frecuencia = b.dataset.valor; marcarActivo(b); },
  'escanear-ticket': () => { const f = $('#foto-ticket'); if (f) f.click(); },
  'usar-total-ticket': () => {
    const imp = $('#imp-gasto');
    if (imp && tmp.totalTicket) imp.value = aDecimalMon(tmp.totalTicket, tmp.moneda);
  },
  'usar-seleccion-ticket': () => {
    const sel = tmp.itemsSeleccion || new Set();
    const suma = [...sel].reduce((s, i) => s + tmp.itemsDetectados[i].importe, 0);
    const imp = $('#imp-gasto');
    if (imp && suma > 0) {
      imp.value = aDecimalMon(suma, tmp.moneda);
      tmp.items = [...sel].map(i => tmp.itemsDetectados[i]);
    }
  },

  // grupos
  'elegir-grupo': b => { grupoActivo = b.dataset.id; busqueda = ''; render(); },
  'nuevo-grupo': () => sheetGrupo(null),
  'editar-grupo': b => { const g = grupo(b.dataset.id); if (g) sheetGrupo(g); },
  'guardar-grupo': () => guardarGrupo(),
  'eliminar-grupo': b => {
    const id = b.dataset.id;
    if (id === 'pareja') { toast(t('noEliminarPareja')); return; }
    sheetConfirmar(t('eliminarGrupo'), t('seguroEliminarGrupo'), t('siEliminar'), () => {
      for (const g of estado.gastos.filter(x => x.grupoId === id)) marcarBorrado(g.id);
      for (const p of estado.pagos.filter(x => x.grupoId === id)) marcarBorrado(p.id);
      for (const r of estado.recurrentes.filter(x => x.grupoId === id)) marcarBorrado(r.id);
      estado.gastos = estado.gastos.filter(x => x.grupoId !== id);
      estado.pagos = estado.pagos.filter(x => x.grupoId !== id);
      estado.recurrentes = estado.recurrentes.filter(x => x.grupoId !== id);
      estado.grupos = estado.grupos.filter(x => x.id !== id);
      marcarBorrado(id);
      grupoActivo = 'pareja';
      guardar(); render(); toast(t('grupoEliminado'));
    });
  },
  'alternar-miembro': b => {
    const pid = b.dataset.valor;
    if (tmp.miembros.has(pid)) tmp.miembros.delete(pid);
    else tmp.miembros.add(pid);
    b.classList.toggle('activo', tmp.miembros.has(pid));
  },
  'elegir-emoji-grupo': b => { tmp.emoji = b.dataset.valor; marcarActivo(b); },
  'crear-amigo': () => {
    const inp = $('#nuevo-amigo');
    const nom = inp ? inp.value.trim() : '';
    if (!nom) return;
    const id = uid();
    estado.personas.push({ id, nombre: nom.slice(0, 20), emoji: EMOJIS_PERSONA[Math.floor(Math.random() * EMOJIS_PERSONA.length)], mod: ahora() });
    tmp.miembros.add(id);
    guardar();
    const chips = $('#chips-miembros');
    if (chips) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.action = 'alternar-miembro';
      btn.dataset.valor = id;
      btn.className = 'activo';
      btn.textContent = emojiDe(id) + ' ' + nom;
      chips.appendChild(btn);
    }
    inp.value = '';
    toast(t('amigoAnadido', nom));
  },

  // saldar
  'abrir-saldar': b => sheetSaldar(b.dataset.grupo || grupoActivo),
  'confirmar-saldar': () => confirmarSaldar(),
  'elegir-metodo': b => { tmp.metodo = b.dataset.valor; marcarActivo(b); },
  'registrar-transferencia': b => {
    const tr = tmp.transferencias && tmp.transferencias[+b.dataset.idx];
    const gr = grupo(tmp.grupoId);
    if (!tr || !gr) return;
    estado.pagos.push({ id: uid(), grupoId: gr.id, de: tr.de, para: tr.para, importe: tr.importe, metodo: tmp.metodo || 'efectivo', fecha: hoyISO(), mod: ahora() });
    guardar(); vibrar(12); render();
    sheetSaldar(gr.id);
    toast(t('pagoRegistrado'));
  },

  // herramientas
  'abrir-totales': () => sheetTotales(),
  'abrir-recurrentes': () => sheetRecurrentes(),
  'alternar-recurrente': b => {
    const r = estado.recurrentes.find(x => x.id === b.dataset.id);
    if (r) { r.activo = !r.activo; r.mod = ahora(); guardar(); sheetRecurrentes(); }
  },
  'eliminar-recurrente': b => {
    const id = b.dataset.id;
    estado.recurrentes = estado.recurrentes.filter(x => x.id !== id);
    marcarBorrado(id);
    guardar(); sheetRecurrentes();
  },
  'abrir-csv': () => sheetCSV(),
  'elegir-csv': () => { const f = $('#archivo-csv'); if (f) f.click(); },
  'elegir-csv-pagador': b => { tmp.pagadoPor = b.dataset.valor; marcarActivo(b); },
  'importar-csv-confirmar': () => importarCSVConfirmar(),

  // portada de mes
  'subir-portada-mes': b => {
    tmp.portadaGrupoId = b.dataset.grupo;
    tmp.portadaYm = b.dataset.ym;
    const f = $('#foto-portada-mes');
    if (f) f.click();
  },
  'quitar-portada-mes': b => {
    const grupoId = b.dataset.grupo, ym = b.dataset.ym;
    sheetConfirmar('🗑️ Quitar foto', '¿Seguro? Se quitará para los dos.', 'Sí, quitar', () => {
      quitarPortadaMes(grupoId, ym);
      guardar(); render(); toast('Foto quitada 🗑️');
    });
  },

  // metas
  'nueva-meta': () => sheetMeta(null),
  'abrir-meta': b => { const o = estado.objetivos.find(x => x.id === b.dataset.id); if (o) sheetDetalleMeta(o); },
  'editar-meta': b => { const o = estado.objetivos.find(x => x.id === b.dataset.id); if (o) sheetMeta(o); },
  'guardar-meta': () => guardarMeta(),
  'eliminar-meta': b => {
    const id = b.dataset.id;
    sheetConfirmar(t('eliminarMeta'), t('seguroEliminarMeta'), t('siEliminar'), () => {
      estado.objetivos = estado.objetivos.filter(x => x.id !== id);
      estado.retos.forEach(r => { if (r.objetivoId === id) { r.objetivoId = null; r.mod = ahora(); } });
      marcarBorrado(id);
      guardar(); render(); toast(t('metaEliminada'));
    });
  },
  'elegir-emoji-meta': b => { tmp.emoji = b.dataset.valor; marcarActivo(b); },
  'sugerencia-meta': b => {
    const s = SUGERENCIAS_META()[+b.dataset.idx];
    $('#nombre-meta').value = s.nombre;
    $('#imp-meta').value = aDecimal(s.meta);
    tmp.emoji = s.emoji;
    document.querySelectorAll('#chips-emoji-meta button').forEach(x => x.classList.toggle('activo', x.dataset.valor === s.emoji));
  },
  'abrir-aporte': b => { const o = estado.objetivos.find(x => x.id === b.dataset.id); if (o) sheetAporte(o); },
  'guardar-aporte': () => guardarAporte(),
  'elegir-aportador': b => { tmp.miembro = b.dataset.valor; marcarActivo(b); },
  'importe-rapido': b => { const inp = $('#imp-aporte'); if (inp) { inp.value = aDecimal(+b.dataset.valor); inp.focus(); } },

  // retos
  'nuevo-reto': () => sheetReto(null),
  'elegir-plantilla': b => sheetReto(PLANTILLAS_RETO()[+b.dataset.idx]),
  'guardar-reto': () => guardarReto(),
  'abrir-reto': b => { const r = estado.retos.find(x => x.id === b.dataset.id); if (r) sheetDetalleReto(r); },
  'checkin': b => hacerCheckin(b.dataset.id, b.dataset.miembro),
  'completar-reto': b => completarReto(b.dataset.id),
  'abandonar-reto': b => {
    const id = b.dataset.id;
    sheetConfirmar(t('abandonarReto'), t('seguroAbandonar'), t('siAbandonar'), () => {
      const r = estado.retos.find(x => x.id === id);
      if (r) { r.estado = 'cancelado'; r.finalizadoEl = ahora(); r.mod = ahora(); }
      guardar(); render(); toast(t('retoAbandonado'));
    });
  },
  'elegir-emoji-reto': b => { tmp.emoji = b.dataset.valor; marcarActivo(b); },
  'elegir-modo': b => { tmp.modo = b.dataset.valor; marcarActivo(b); },

  // ajustes
  'editar-pareja': () => sheetEditarPareja(),
  'guardar-pareja-edit': () => {
    const na = $('#edit-nombre-a').value.trim();
    const nb = $('#edit-nombre-b').value.trim();
    if (!na || !nb) return errorForm(t('nombresFaltan'));
    const pa = persona('a'), pb = persona('b');
    pa.nombre = na; pb.nombre = nb;
    pa.emoji = textoEmojiActivo('emoji-a') || pa.emoji;
    pb.emoji = textoEmojiActivo('emoji-b') || pb.emoji;
    pa.mod = pb.mod = ahora();
    guardar(); cerrarSheet(); render(); toast(t('guardado'));
  },
  'exportar-datos': () => exportarDatos(),
  'importar-datos': () => $('#importador').click(),
  'borrar-todo': () => {
    sheetConfirmar(t('empezarDeCero') + ' 🗑️', t('seguroBorrarTodo'), t('borrarTodo'), () => {
      estado = estadoInicial();
      try { localStorage.removeItem(CLAVE_V1); } catch (_) {}
      guardar(); render(); toast(t('todoBorrado'));
    });
  },
  'salir-sala': () => { window.SYNC.salirSala(); sheetAjustes(); toast(t('sinSala')); },
  'sala-desde-ajustes': () => {
    cerrarSheet();
    // sin sala: mostramos el onboarding de emparejamiento reutilizando la UI existente
    sheetSala();
  },
  'crear-sala-sheet': async () => {
    const codigo = await window.SYNC.crearSala();
    if (codigo) { sheetSala(codigo); toast(t('salaCreada', codigo)); }
  },
  'unirse-sala-sheet': async () => {
    const inp = $('#codigo-sala-sheet');
    const codigo = await window.SYNC.unirseSala(inp ? inp.value : '');
    if (!codigo) return errorForm(t('salaInvalida'));
    cerrarSheet();
    toast(t('salaUnida', codigo));
  },
  'confirmar-si': () => { const cb = confirmCb; confirmCb = null; cerrarSheet(); if (cb) cb(); },

  // avisos
  'activar-avisos': async () => {
    disp.avisosOfrecidos = true;
    guardarDisp();
    if ('Notification' in window) {
      try {
        const permiso = await Notification.requestPermission();
        toast(permiso === 'granted' ? '🔔 Avisos activados' : 'Vale, sin avisos del sistema');
      } catch (_) {}
    }
    render();
  },
  'ignorar-prompt-avisos': () => { disp.avisosOfrecidos = true; guardarDisp(); render(); },
  'alternar-novedades': () => { tmp.novedadesAbiertas = !tmp.novedadesAbiertas; render(); },
  'descartar-novedades': () => {
    disp.novedadesPendientes = [];
    disp.ultimaVista = ahora();
    guardarDisp();
    render();
  }
};

function sheetSala(codigoNuevo) {
  abrirSheet(`
    <h3 class="sheet-titulo">📡 ${t('sala')}
      <button class="btn-icono" data-action="cerrar-sheet" aria-label="✕">✕</button>
    </h3>
    ${codigoNuevo ? `<div class="carta" style="text-align:center;padding:22px;margin-bottom:14px">
      <div style="font-family:var(--fuente-num);font-size:34px;letter-spacing:.3em;color:var(--menta)">${esc(codigoNuevo)}</div>
      <p style="color:var(--bruma);font-size:13px;margin-top:8px">${t('salaCreada', esc(codigoNuevo))}</p>
    </div>` : ''}
    <div class="campo">
      <label for="codigo-sala-sheet">${t('codigoSala')}</label>
      <input id="codigo-sala-sheet" type="text" maxlength="6" placeholder="${t('seisDigitos')}" autocomplete="off"
        style="text-align:center;font-size:22px;letter-spacing:.25em;text-transform:uppercase;font-family:var(--fuente-num)">
    </div>
    <p class="error-form" id="error-form" hidden></p>
    <div class="acciones-sheet" style="margin-top:0">
      <button class="btn-suave" style="flex:1" data-action="crear-sala-sheet">${t('crearSala')}</button>
      <button class="btn-principal" style="flex:1" data-action="unirse-sala-sheet">${t('unirseSala')}</button>
    </div>
  `);
}

/* ============================================================
   LISTENERS
   ============================================================ */
document.addEventListener('click', e => {
  const em = e.target.closest('.emojis button');
  if (em) {
    em.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('activo', x === em));
    return;
  }
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const fn = acciones[btn.dataset.action];
  if (fn) {
    if (btn.tagName === 'BUTTON' || btn.getAttribute('role') === 'button') e.preventDefault();
    fn(btn, e);
  }
});

// accesibilidad: Enter/Espacio sobre tarjetas con role=button
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrarSheet(); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'button') {
    e.preventDefault();
    const fn = acciones[e.target.dataset.action];
    if (fn) fn(e.target, e);
  }
});

document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'buscador') {
    busqueda = el.value;
    // repinta solo la lista sin perder el foco
    const vista = $('#vista-gastos');
    if (vista && !vista.hidden) {
      const pos = el.selectionStart;
      vista.innerHTML = vGastos();
      const nuevo = $('#buscador');
      if (nuevo) { nuevo.focus(); nuevo.setSelectionRange(pos, pos); }
    }
    return;
  }
  // autocompletar la última parte en reparto exacto (solo con 2 participantes)
  if (el.dataset && el.dataset.parte && tmp.tipo === 'exacto' && tmp.participantes && tmp.participantes.size === 2) {
    const gr = grupo(tmp.grupoId);
    const importeTxt = $('#imp-gasto');
    const total = importeTxt ? parseImporteMon(importeTxt.value, gr ? gr.moneda : 'EUR') : null;
    if (total == null) return;
    const v = parseImporteMon(el.value, gr ? gr.moneda : 'EUR');
    if (v == null) return;
    const otroPid = [...tmp.participantes].find(p => p !== el.dataset.parte);
    const otro = $('#parte-' + otroPid);
    if (otro) otro.value = aDecimalMon(Math.max(0, total - v), gr ? gr.moneda : 'EUR');
  }
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'sel-moneda') {
    const gr = grupoPareja();
    gr.moneda = sMoneda(el.value);
    gr.mod = ahora();
    estado.ajustes.moneda = gr.moneda;
    estado.ajustes.mod = ahora();
    guardar(); render();
    toast(t('monedaActualizada'));
  }
  if (el.id === 'sel-idioma') {
    window.idiomaActual = el.value;
    estado.ajustes.idioma = el.value;
    estado.ajustes.mod = ahora();
    guardar(); render();
    sheetAjustes();
    toast(t('idiomaActualizado'));
  }
  if (el.id === 'inp-paypal') {
    estado.ajustes.paypal = el.value.trim().replace(/[^\w.-]/g, '').slice(0, 30);
    estado.ajustes.mod = ahora();
    guardar();
  }
  if (el.id === 'importador') {
    const f = el.files[0];
    el.value = '';
    if (f) importarDatos(f);
  }
  if (el.id === 'archivo-csv') {
    const f = el.files[0];
    el.value = '';
    if (f) {
      const lector = new FileReader();
      lector.onload = () => {
        try {
          const gr = grupo(tmp.grupoId);
          csvFilas = parsearCSV(String(lector.result), gr ? gr.moneda : 'EUR');
          pintarVistaCSV();
        } catch (_) { toast(t('csvError')); }
      };
      lector.readAsText(f);
    }
  }
  if (el.id === 'foto-ticket') {
    const f = el.files[0];
    el.value = '';
    if (f) procesarTicket(f);
  }
  if (el.id === 'foto-portada-mes') {
    const f = el.files[0];
    el.value = '';
    if (f) procesarPortadaMes(f);
  }
  if (el.id === 'mon-gasto') {
    tmp.moneda = el.value;
    const gr = grupo(tmp.grupoId);
    tmp.tasa = tasaCambio(tmp.moneda, gr.moneda);
    const z = $('#zona-tasa');
    if (z) z.innerHTML = htmlZonaTasa(gr);
    const zr = $('#zona-reparto');
    if (zr) zr.innerHTML = htmlZonaReparto();
  }
  if (el.id === 'chk-recurrente') {
    const z = $('#zona-frecuencia');
    if (z) z.hidden = !el.checked;
  }
  if (el.dataset && el.dataset.actionCheck === 'item-ticket') {
    const i = +el.dataset.idx;
    tmp.itemsSeleccion = tmp.itemsSeleccion || new Set();
    if (el.checked) tmp.itemsSeleccion.add(i);
    else tmp.itemsSeleccion.delete(i);
    const zona = $('#zona-items');
    if (zona) zona.innerHTML = htmlZonaItems();
  }
});

// cerrar hoja al tocar el velo
$('#velo').addEventListener('click', e => { if (e.target.id === 'velo') cerrarSheet(); });

/* ---------- onboarding y emparejamiento ---------- */
$('#form-pareja').addEventListener('submit', e => {
  e.preventDefault();
  const na = $('#nombre-a').value.trim();
  const nb = $('#nombre-b').value.trim();
  if (!na || !nb) return;
  const m = ahora();
  const yaA = estado.personas.find(p => p.id === 'a');
  const yaB = estado.personas.find(p => p.id === 'b');
  if (yaA) { yaA.nombre = na; yaA.emoji = textoEmojiActivo('emoji-a') || yaA.emoji; yaA.mod = m; }
  else estado.personas.push({ id: 'a', nombre: na, emoji: textoEmojiActivo('emoji-a') || '🦊', mod: m });
  if (yaB) { yaB.nombre = nb; yaB.emoji = textoEmojiActivo('emoji-b') || yaB.emoji; yaB.mod = m; }
  else estado.personas.push({ id: 'b', nombre: nb, emoji: textoEmojiActivo('emoji-b') || '🐰', mod: m });
  if (!grupoPareja()) estado.grupos.unshift(grupoParejaNuevo(estado.ajustes.moneda));
  guardar(); render();
  toast(t('bienvenidos', na, nb));
});

function msgPairing(txt) {
  const el = $('#pairingMsg');
  if (el) el.textContent = txt;
}
const btnCrear = $('#btnCreateRoom');
if (btnCrear) btnCrear.addEventListener('click', async () => {
  if (!hayPareja()) {
    // permite crear sala antes de guardar nombres: guarda unos por defecto si están escritos
    const na = $('#nombre-a').value.trim(), nb = $('#nombre-b').value.trim();
    if (!na || !nb) { msgPairing(t('nombresPrimero')); return; }
    $('#form-pareja').requestSubmit();
  }
  const codigo = await window.SYNC.crearSala();
  const inp = $('#roomCodeInput');
  if (inp) inp.value = codigo;
  msgPairing(t('salaCreada', codigo));
  toast(t('salaCreada', codigo));
});
const btnUnirse = $('#btnJoinRoom');
if (btnUnirse) btnUnirse.addEventListener('click', async () => {
  const inp = $('#roomCodeInput');
  const codigo = await window.SYNC.unirseSala(inp ? inp.value : '');
  if (!codigo) { msgPairing(t('salaInvalida')); return; }
  msgPairing(t('salaUnida', codigo));
  toast(t('salaUnida', codigo));
  // si aún no hay nombres, el estado remoto los traerá al fusionar
});

/* ---------- arranque ---------- */
const generados = materializarRecurrentes();
render();
if (generados) toast(t('recurrenteGenerado', generados));
window.SYNC.iniciar();
if (navigator.onLine) refrescarTasas();

if ('serviceWorker' in navigator && !location.search.includes('dev')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
