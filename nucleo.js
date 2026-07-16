/* ============================================================
   KOAPLIT v2 — núcleo: estado, dinero, divisas y cálculos
   ============================================================ */
'use strict';

const CLAVE = 'koaplit-v2';
const CLAVE_V1 = 'koaplit-v1';
const CLAVE_DISP = 'koaplit-disp';
const CLAVE_TASAS = 'koaplit-tasas';
const VERSION_APP = '2.0.0';

const $ = sel => document.querySelector(sel);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const ahora = () => new Date().toISOString();

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- fechas ---------- */
function hoyISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fechaBonita(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const f = new Date(y, m - 1, d);
  const opts = { day: 'numeric', month: 'short' };
  if (f.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return f.toLocaleDateString(window.idiomaActual, opts);
}
function mesBonito(ym) {
  const [y, m] = ym.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString(window.idiomaActual, { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function diasRestantes(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d) - hoy) / 86400000);
}
function sumarFrecuencia(iso, frec) {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  if (frec === 'semanal') f.setDate(f.getDate() + 7);
  else if (frec === 'quincenal') f.setDate(f.getDate() + 14);
  else f.setMonth(f.getMonth() + 1);
  return f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
}

/* ---------- dinero y divisas ---------- */
let LISTA_MONEDAS = ['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'BRL', 'CHF', 'JPY'];
try {
  if (Intl.supportedValuesOf) LISTA_MONEDAS = Intl.supportedValuesOf('currency');
} catch (_) {}

const _digitosCache = {};
function digitosMoneda(m) {
  if (_digitosCache[m] == null) {
    try {
      _digitosCache[m] = new Intl.NumberFormat('en', { style: 'currency', currency: m }).resolvedOptions().maximumFractionDigits;
    } catch (_) { _digitosCache[m] = 2; }
  }
  return _digitosCache[m];
}
const factorMoneda = m => Math.pow(10, digitosMoneda(m));

function nombreMoneda(codigo) {
  try {
    const dn = new Intl.DisplayNames(window.idiomaActual, { type: 'currency' });
    return dn.of(codigo) || codigo;
  } catch (_) { return codigo; }
}

function fmtMon(minor, moneda) {
  try {
    return new Intl.NumberFormat(window.idiomaActual === 'es' ? 'es-ES' : window.idiomaActual, { style: 'currency', currency: moneda }).format(minor / factorMoneda(moneda));
  } catch (_) {
    return (minor / 100).toFixed(2) + ' ' + moneda;
  }
}
function fmt(minor) { return fmtMon(minor, monedaPareja()); }

function parseImporteMon(texto, moneda) {
  if (texto == null) return null;
  let s = String(texto).trim().replace(/[^\d.,-]/g, '');
  if (!s) return null;
  const neg = s.startsWith('-');
  s = s.replace(/-/g, '');
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  else s = s.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const v = Number(s);
  if (!isFinite(v) || v > 1e10) return null;
  const minor = Math.round(v * factorMoneda(moneda));
  return neg ? -minor : minor;
}
function parseImporte(texto) { return parseImporteMon(texto, monedaPareja()); }
function aDecimalMon(minor, moneda) {
  return (minor / factorMoneda(moneda)).toFixed(digitosMoneda(moneda)).replace('.', ',');
}
function aDecimal(minor) { return aDecimalMon(minor, monedaPareja()); }

/* tasas de cambio (base EUR) — semilla estática, se refresca online */
const TASAS_SEED = {
  EUR: 1, USD: 1.08, GBP: 0.85, CHF: 0.95, JPY: 170, MXN: 19.5, ARS: 1050, COP: 4600,
  CLP: 1020, PEN: 4.05, BRL: 6.1, CAD: 1.48, AUD: 1.65, CNY: 7.8, SEK: 11.3, NOK: 11.6,
  DKK: 7.46, PLN: 4.3, CZK: 25, HUF: 395, RON: 4.97, TRY: 37, MAD: 10.8, INR: 90,
  KRW: 1480, NZD: 1.78, ZAR: 19.8, ISK: 149, BGN: 1.96, UYU: 43, BOB: 7.5, GTQ: 8.4,
  HNL: 26.6, NIO: 39.5, CRC: 555, DOP: 63, PYG: 7800, VES: 39, PHP: 61, IDR: 17300,
  THB: 37, SGD: 1.42, HKD: 8.4, ILS: 3.9, AED: 3.97, SAR: 4.05, EGP: 53
};
let TASAS = Object.assign({}, TASAS_SEED);
try {
  const guardadas = JSON.parse(localStorage.getItem(CLAVE_TASAS) || 'null');
  if (guardadas && guardadas.tasas) Object.assign(TASAS, guardadas.tasas);
} catch (_) {}

function refrescarTasas() {
  fetch('https://api.frankfurter.dev/v1/latest?base=EUR')
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (j && j.rates) {
        Object.assign(TASAS, j.rates, { EUR: 1 });
        try { localStorage.setItem(CLAVE_TASAS, JSON.stringify({ fecha: hoyISO(), tasas: TASAS })); } catch (_) {}
      }
    })
    .catch(() => {});
}

/* tasa: cuántas unidades de `dest` vale 1 unidad de `orig` */
function tasaCambio(orig, dest) {
  if (orig === dest) return 1;
  const a = TASAS[orig], b = TASAS[dest];
  if (a && b) return b / a;
  return 1;
}
function convertir(minorOrig, orig, dest, tasa) {
  if (orig === dest) return minorOrig;
  const unidades = minorOrig / factorMoneda(orig);
  return Math.round(unidades * tasa * factorMoneda(dest));
}

/* ---------- estado ---------- */
function estadoInicial() {
  return {
    version: 2,
    mod: ahora(),
    ajustes: { moneda: 'EUR', idioma: null, paypal: '', mod: ahora() },
    personas: [],   // {id, nombre, emoji, mod}
    grupos: [],     // {id, nombre, emoji, miembros[], moneda, repartoDef, mod}
    gastos: [],     // {id, grupoId, desc, importe, moneda, importeOriginal, tasa, pagadoPor, partes{pid:minor}, reparto{tipo,participantes,datos}, categoria, fecha, items[], mod}
    pagos: [],      // {id, grupoId, de, para, importe, metodo, fecha, mod}
    recurrentes: [],// {id, grupoId, plantilla{desc,importe,categoria,pagadoPor,partes,reparto}, frecuencia, proxima, activo, mod}
    objetivos: [],  // {id, nombre, emoji, meta, fechaLimite, aportes[], completadoEl, mod}
    retos: [],      // {id, nombre, emoji, importePorCheck, checksMeta, modo, checks[], objetivoId, estado, finalizadoEl, mod}
    borrados: {}    // {id: iso} — lápidas para sincronización
  };
}

let estado = null;
let disp = { yo: 'a', sala: null };

function cargarDisp() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE_DISP) || 'null');
    if (d && typeof d === 'object') disp = Object.assign({ yo: 'a', sala: null }, d);
  } catch (_) {}
}
function guardarDisp() {
  try { localStorage.setItem(CLAVE_DISP, JSON.stringify(disp)); } catch (_) {}
}

/* --- saneado profundo: acepta datos de import/sync sin fiarse de nada --- */
const vId = s => typeof s === 'string' && /^[a-z0-9_-]{1,40}$/i.test(s);
const vFecha = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const vISO = s => typeof s === 'string' && s.length <= 40 && !isNaN(Date.parse(s));
const sTx = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max).trim();
const sEmoji = s => sTx(s, 12) || '📦';
const sInt = (v, tope) => {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 0;
  return Math.max(-(tope || 1e13), Math.min(tope || 1e13, n));
};
const sMoneda = m => (typeof m === 'string' && /^[A-Z]{3}$/.test(m) ? m : 'EUR');

function sanearEstado(bruto) {
  const e = estadoInicial();
  if (!bruto || typeof bruto !== 'object') return e;
  const b = bruto;

  if (b.ajustes && typeof b.ajustes === 'object') {
    e.ajustes.moneda = sMoneda(b.ajustes.moneda);
    e.ajustes.idioma = typeof b.ajustes.idioma === 'string' && window.I18N[b.ajustes.idioma] ? b.ajustes.idioma : null;
    e.ajustes.paypal = sTx(b.ajustes.paypal, 40).replace(/[^\w.-]/g, '');
    e.ajustes.mod = vISO(b.ajustes.mod) ? b.ajustes.mod : ahora();
  }
  e.mod = vISO(b.mod) ? b.mod : ahora();

  // personas
  const vistos = new Set();
  for (const p of Array.isArray(b.personas) ? b.personas : []) {
    if (!p || !vId(p.id) || vistos.has(p.id)) continue;
    vistos.add(p.id);
    e.personas.push({ id: p.id, nombre: sTx(p.nombre, 20) || p.id, emoji: sEmoji(p.emoji), mod: vISO(p.mod) ? p.mod : ahora() });
  }
  const hayPersona = id => e.personas.some(p => p.id === id);

  // grupos
  const gVistos = new Set();
  for (const g of Array.isArray(b.grupos) ? b.grupos : []) {
    if (!g || !vId(g.id) || gVistos.has(g.id)) continue;
    gVistos.add(g.id);
    const miembros = (Array.isArray(g.miembros) ? g.miembros : []).filter(m => vId(m) && hayPersona(m));
    if (miembros.length < 2) continue;
    let repDef = null;
    if (g.repartoDef && typeof g.repartoDef === 'object') repDef = sanearReparto(g.repartoDef, miembros);
    e.grupos.push({
      id: g.id, nombre: sTx(g.nombre, 30) || 'Grupo', emoji: sEmoji(g.emoji),
      miembros, moneda: sMoneda(g.moneda), repartoDef: repDef, mod: vISO(g.mod) ? g.mod : ahora()
    });
  }
  const grupoDe = id => e.grupos.find(g => g.id === id);

  // gastos
  for (const g of Array.isArray(b.gastos) ? b.gastos : []) {
    if (!g || !vId(g.id)) continue;
    const grupo = grupoDe(g.grupoId) || e.grupos[0];
    if (!grupo) continue;
    const partes = {};
    let suma = 0;
    if (g.partes && typeof g.partes === 'object') {
      for (const [pid, v] of Object.entries(g.partes)) {
        if (!vId(pid) || !hayPersona(pid)) continue;
        const n = sInt(v);
        if (n < 0) continue;
        partes[pid] = n; suma += n;
      }
    }
    if (!Object.keys(partes).length || suma <= 0) continue;
    const pagadoPor = vId(g.pagadoPor) && hayPersona(g.pagadoPor) ? g.pagadoPor : Object.keys(partes)[0];
    e.gastos.push({
      id: g.id, grupoId: grupo.id, desc: sTx(g.desc, 60) || '·', importe: suma,
      moneda: sMoneda(g.moneda || grupo.moneda), importeOriginal: sInt(g.importeOriginal) || suma,
      tasa: Number.isFinite(Number(g.tasa)) && Number(g.tasa) > 0 ? Number(g.tasa) : 1,
      pagadoPor, partes, reparto: sanearReparto(g.reparto, Object.keys(partes)),
      categoria: sEmoji(g.categoria || '📦'), fecha: vFecha(g.fecha) ? g.fecha : hoyISO(),
      items: (Array.isArray(g.items) ? g.items : []).slice(0, 60).map(it => ({ desc: sTx(it && it.desc, 48), importe: sInt(it && it.importe) })),
      mod: vISO(g.mod) ? g.mod : (vISO(g.creadoEl) ? g.creadoEl : ahora())
    });
  }

  // pagos
  for (const p of Array.isArray(b.pagos) ? b.pagos : []) {
    if (!p || !vId(p.id) || !vId(p.de) || !hayPersona(p.de)) continue;
    const grupo = grupoDe(p.grupoId) || e.grupos[0];
    if (!grupo) continue;
    const para = vId(p.para) && hayPersona(p.para) ? p.para : (grupo.miembros.find(m => m !== p.de) || p.de);
    const imp = sInt(p.importe);
    if (imp <= 0) continue;
    e.pagos.push({
      id: p.id, grupoId: grupo.id, de: p.de, para, importe: imp,
      metodo: sTx(p.metodo, 16) || 'efectivo', fecha: vFecha(p.fecha) ? p.fecha : hoyISO(),
      mod: vISO(p.mod) ? p.mod : (vISO(p.creadoEl) ? p.creadoEl : ahora())
    });
  }

  // recurrentes
  for (const r of Array.isArray(b.recurrentes) ? b.recurrentes : []) {
    if (!r || !vId(r.id) || !r.plantilla || typeof r.plantilla !== 'object') continue;
    const grupo = grupoDe(r.grupoId);
    if (!grupo) continue;
    const pl = r.plantilla;
    const partes = {};
    let suma = 0;
    if (pl.partes && typeof pl.partes === 'object') {
      for (const [pid, v] of Object.entries(pl.partes)) {
        if (!hayPersona(pid)) continue;
        const n = sInt(v); if (n < 0) continue;
        partes[pid] = n; suma += n;
      }
    }
    if (suma <= 0) continue;
    e.recurrentes.push({
      id: r.id, grupoId: grupo.id,
      plantilla: {
        desc: sTx(pl.desc, 60) || '·', importe: suma, categoria: sEmoji(pl.categoria || '📦'),
        pagadoPor: hayPersona(pl.pagadoPor) ? pl.pagadoPor : grupo.miembros[0],
        partes, reparto: sanearReparto(pl.reparto, Object.keys(partes))
      },
      frecuencia: ['semanal', 'quincenal', 'mensual'].includes(r.frecuencia) ? r.frecuencia : 'mensual',
      proxima: vFecha(r.proxima) ? r.proxima : hoyISO(),
      activo: r.activo !== false, mod: vISO(r.mod) ? r.mod : ahora()
    });
  }

  // objetivos
  for (const o of Array.isArray(b.objetivos) ? b.objetivos : []) {
    if (!o || !vId(o.id)) continue;
    const aportes = [];
    for (const a of Array.isArray(o.aportes) ? o.aportes : []) {
      if (!a || !vId(a.id)) continue;
      const imp = sInt(a.importe); if (imp <= 0) continue;
      aportes.push({
        id: a.id, miembro: hayPersona(a.miembro) ? a.miembro : 'a', importe: imp,
        fecha: vFecha(a.fecha) ? a.fecha : hoyISO(), origen: a.origen ? sTx(a.origen, 40) : null,
        creadoEl: vISO(a.creadoEl) ? a.creadoEl : ahora()
      });
    }
    const meta = Math.max(1, sInt(o.meta));
    e.objetivos.push({
      id: o.id, nombre: sTx(o.nombre, 40) || '·', emoji: sEmoji(o.emoji || '🎯'), meta,
      fechaLimite: vFecha(o.fechaLimite) ? o.fechaLimite : null, aportes,
      completadoEl: vISO(o.completadoEl) ? o.completadoEl : null,
      mod: vISO(o.mod) ? o.mod : ahora()
    });
  }

  // retos
  for (const r of Array.isArray(b.retos) ? b.retos : []) {
    if (!r || !vId(r.id)) continue;
    const imp = sInt(r.importePorCheck); if (imp <= 0) continue;
    const checksMeta = Math.min(200, Math.max(1, sInt(r.checksMeta)));
    const checks = (Array.isArray(r.checks) ? r.checks : []).slice(0, 400)
      .filter(c => c && vFecha(c.fecha))
      .map(c => ({ fecha: c.fecha, miembro: hayPersona(c.miembro) ? c.miembro : 'a' }));
    e.retos.push({
      id: r.id, nombre: sTx(r.nombre, 40) || '·', emoji: sEmoji(r.emoji || '🔥'),
      importePorCheck: imp, checksMeta, modo: r.modo === 'creciente' ? 'creciente' : 'fijo',
      checks, objetivoId: vId(r.objetivoId) && e.objetivos.some(o => o.id === r.objetivoId) ? r.objetivoId : null,
      estado: ['activo', 'completado', 'cancelado'].includes(r.estado) ? r.estado : 'activo',
      finalizadoEl: vISO(r.finalizadoEl) ? r.finalizadoEl : null,
      mod: vISO(r.mod) ? r.mod : ahora()
    });
  }

  // lápidas
  if (b.borrados && typeof b.borrados === 'object') {
    let n = 0;
    for (const [id, cuando] of Object.entries(b.borrados)) {
      if (vId(id) && vISO(cuando) && n < 3000) { e.borrados[id] = cuando; n++; }
    }
  }
  return e;
}

function sanearReparto(rep, participantes) {
  const tipos = ['mitad', 'exacto', 'porcentaje', 'cuotas', 'uno'];
  if (!rep || typeof rep !== 'object' || !tipos.includes(rep.tipo)) {
    return { tipo: 'exacto', participantes: participantes.slice(0, 20), datos: {} };
  }
  const parts = (Array.isArray(rep.participantes) ? rep.participantes : participantes).filter(vId).slice(0, 20);
  const datos = {};
  if (rep.datos && typeof rep.datos === 'object') {
    for (const [k, v] of Object.entries(rep.datos)) {
      if (vId(k)) datos[k] = Math.max(0, Number(v) || 0);
    }
  }
  return { tipo: rep.tipo, participantes: parts, datos };
}

/* ¿hay pareja configurada? */
const hayPareja = () => !!(estado && estado.personas.some(p => p.id === 'a') && estado.personas.some(p => p.id === 'b'));

function migrarV1(v1) {
  const e = estadoInicial();
  if (!v1 || typeof v1 !== 'object' || !v1.pareja) return null;
  const m = ahora();
  e.ajustes.moneda = sMoneda(v1.ajustes && v1.ajustes.moneda);
  e.personas = [
    { id: 'a', nombre: sTx(v1.pareja.a.nombre, 20) || 'A', emoji: sEmoji(v1.pareja.a.emoji), mod: m },
    { id: 'b', nombre: sTx(v1.pareja.b.nombre, 20) || 'B', emoji: sEmoji(v1.pareja.b.emoji), mod: m }
  ];
  e.grupos = [grupoParejaNuevo(e.ajustes.moneda)];
  for (const g of v1.gastos || []) {
    const partes = { a: sInt(g.parteA), b: sInt(g.parteB) };
    e.gastos.push({
      id: g.id || uid(), grupoId: 'pareja', desc: sTx(g.desc, 60), importe: partes.a + partes.b,
      moneda: e.ajustes.moneda, importeOriginal: partes.a + partes.b, tasa: 1,
      pagadoPor: g.pagadoPor === 'b' ? 'b' : 'a', partes,
      reparto: { tipo: g.reparto === 'mitad' ? 'mitad' : g.reparto === 'uno' ? 'uno' : 'exacto', participantes: ['a', 'b'], datos: g.reparto === 'uno' ? { [g.deudor === 'a' ? 'a' : 'b']: 1 } : {} },
      categoria: sEmoji(g.categoria || '📦'), fecha: vFecha(g.fecha) ? g.fecha : hoyISO(), items: [],
      mod: vISO(g.creadoEl) ? g.creadoEl : m
    });
  }
  for (const p of v1.pagos || []) {
    e.pagos.push({
      id: p.id || uid(), grupoId: 'pareja', de: p.de === 'b' ? 'b' : 'a', para: p.de === 'b' ? 'a' : 'b',
      importe: sInt(p.importe), metodo: 'efectivo', fecha: vFecha(p.fecha) ? p.fecha : hoyISO(),
      mod: vISO(p.creadoEl) ? p.creadoEl : m
    });
  }
  e.objetivos = (v1.objetivos || []).map(o => Object.assign({}, o, { mod: vISO(o.creadoEl) ? o.creadoEl : m }));
  e.retos = (v1.retos || []).map(r => Object.assign({}, r, { mod: vISO(r.creadoEl) ? r.creadoEl : m }));
  return sanearEstado(e);
}

function grupoParejaNuevo(moneda) {
  return { id: 'pareja', nombre: '', emoji: '💞', miembros: ['a', 'b'], moneda: moneda || 'EUR', repartoDef: null, mod: ahora() };
}

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return sanearEstado(JSON.parse(crudo));
  } catch (_) {}
  try {
    const v1 = localStorage.getItem(CLAVE_V1);
    if (v1) {
      const migrado = migrarV1(JSON.parse(v1));
      if (migrado) return migrado;
    }
  } catch (_) {}
  return estadoInicial();
}

let _avisoGuardar = false;
function guardar() {
  estado.mod = ahora();
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    _avisoGuardar = false;
  } catch (err) {
    if (!_avisoGuardar && typeof toast === 'function') {
      _avisoGuardar = true;
      toast('⚠️ No pude guardar (¿almacenamiento lleno?)');
    }
  }
  if (window.SYNC) window.SYNC.programarEnvio();
}

function marcarBorrado(id) { estado.borrados[id] = ahora(); }

/* ---------- accesores ---------- */
const persona = id => estado.personas.find(p => p.id === id) || { id, nombre: '?', emoji: '❔' };
const nombre = id => persona(id).nombre;
const emojiDe = id => persona(id).emoji;
const elOtro = id => (id === 'a' ? 'b' : 'a');
const grupoPareja = () => estado.grupos.find(g => g.id === 'pareja');
const monedaPareja = () => { const g = grupoPareja(); return g ? g.moneda : estado.ajustes.moneda; };
const grupo = id => estado.grupos.find(g => g.id === id);
const gastosDe = gid => estado.gastos.filter(g => g.grupoId === gid);
const pagosDe = gid => estado.pagos.filter(p => p.grupoId === gid);

function nombreGrupo(g) {
  if (g.id === 'pareja') return nombre('a') + ' + ' + nombre('b');
  return g.nombre;
}

/* ---------- reparto ---------- */
function calcularPartes(tipo, participantes, datos, importe, pagadoPor) {
  const partes = {};
  if (!participantes.length) return null;
  if (tipo === 'uno') {
    const quien = Object.keys(datos)[0] || participantes[0];
    partes[quien] = importe;
    return partes;
  }
  if (tipo === 'exacto') {
    let suma = 0;
    for (const pid of participantes) {
      const v = Math.round(datos[pid] || 0);
      if (v < 0) return null;
      partes[pid] = v; suma += v;
    }
    return suma === importe ? partes : null;
  }
  let pesos;
  if (tipo === 'mitad') pesos = participantes.map(() => 1);
  else if (tipo === 'porcentaje') {
    pesos = participantes.map(pid => Number(datos[pid]) || 0);
    const sumaPct = pesos.reduce((s, x) => s + x, 0);
    if (Math.abs(sumaPct - 100) > 0.01) return null;
  } else { // cuotas
    pesos = participantes.map(pid => Number(datos[pid]) || 0);
    if (pesos.some(x => x < 0) || pesos.every(x => x === 0)) return null;
  }
  const total = pesos.reduce((s, x) => s + x, 0);
  if (total <= 0) return null;
  let asignado = 0;
  participantes.forEach((pid, i) => {
    partes[pid] = Math.floor(importe * pesos[i] / total);
    asignado += partes[pid];
  });
  // repartir el resto de céntimos: primero al pagador si participa, luego en orden
  let resto = importe - asignado;
  const orden = [...participantes].sort((x, y) => (y === pagadoPor) - (x === pagadoPor));
  let i = 0;
  while (resto > 0) { partes[orden[i % orden.length]]++; resto--; i++; }
  return partes;
}

function etiquetaReparto(g) {
  const tipo = g.reparto && g.reparto.tipo;
  if (tipo === 'mitad') return t('aMedias');
  if (tipo === 'porcentaje') return t('porcentaje');
  if (tipo === 'cuotas') return t('cuotas');
  if (tipo === 'uno') {
    const quien = Object.keys(g.partes).find(pid => g.partes[pid] === g.importe);
    return t('todoPara', quien ? nombre(quien) : '?');
  }
  return t('exacto');
}

/* ---------- balances ---------- */
function netosGrupo(gid) {
  const netos = {};
  const g = grupo(gid);
  if (!g) return netos;
  for (const m of g.miembros) netos[m] = 0;
  for (const gasto of gastosDe(gid)) {
    if (netos[gasto.pagadoPor] == null) netos[gasto.pagadoPor] = 0;
    netos[gasto.pagadoPor] += gasto.importe;
    for (const [pid, parte] of Object.entries(gasto.partes)) {
      if (netos[pid] == null) netos[pid] = 0;
      netos[pid] -= parte;
    }
  }
  for (const pago of pagosDe(gid)) {
    if (netos[pago.de] == null) netos[pago.de] = 0;
    if (netos[pago.para] == null) netos[pago.para] = 0;
    netos[pago.de] += pago.importe;
    netos[pago.para] -= pago.importe;
  }
  return netos;
}

function balanceParejaNetoA() {
  const netos = netosGrupo('pareja');
  return netos.a || 0;
}

/* deudas simplificadas: lista mínima de transferencias */
function simplificarDeudas(netos) {
  const deudores = [], acreedores = [];
  for (const [pid, n] of Object.entries(netos)) {
    if (n < 0) deudores.push({ pid, resta: -n });
    else if (n > 0) acreedores.push({ pid, resta: n });
  }
  deudores.sort((x, y) => y.resta - x.resta);
  acreedores.sort((x, y) => y.resta - x.resta);
  const transferencias = [];
  let i = 0, j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const cant = Math.min(deudores[i].resta, acreedores[j].resta);
    if (cant > 0) transferencias.push({ de: deudores[i].pid, para: acreedores[j].pid, importe: cant });
    deudores[i].resta -= cant;
    acreedores[j].resta -= cant;
    if (deudores[i].resta === 0) i++;
    if (acreedores[j].resta === 0) j++;
  }
  return transferencias;
}

/* ---------- totales y análisis ---------- */
function totalesGrupo(gid) {
  const gastos = gastosDe(gid);
  const hoy = hoyISO();
  const mesActual = hoy.slice(0, 7);
  const d = new Date(); d.setMonth(d.getMonth() - 1);
  const mesPrevio = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  const res = {
    total: 0, mesActual: 0, mesPrevio: 0,
    porCategoria: {}, porPersona: {}, parteJusta: {}, porMes: {}
  };
  for (const g of gastos) {
    res.total += g.importe;
    const ym = g.fecha.slice(0, 7);
    res.porMes[ym] = (res.porMes[ym] || 0) + g.importe;
    if (ym === mesActual) res.mesActual += g.importe;
    if (ym === mesPrevio) res.mesPrevio += g.importe;
    res.porCategoria[g.categoria] = (res.porCategoria[g.categoria] || 0) + g.importe;
    res.porPersona[g.pagadoPor] = (res.porPersona[g.pagadoPor] || 0) + g.importe;
    for (const [pid, parte] of Object.entries(g.partes)) {
      res.parteJusta[pid] = (res.parteJusta[pid] || 0) + parte;
    }
  }
  return res;
}

/* ---------- metas ---------- */
const aportadoMeta = o => o.aportes.reduce((s, a) => s + a.importe, 0);
const aportadoMetaDe = (o, m) => o.aportes.reduce((s, a) => s + (a.miembro === m ? a.importe : 0), 0);

/* ---------- retos ---------- */
function importeCheck(reto, i1) { return reto.modo === 'creciente' ? reto.importePorCheck * i1 : reto.importePorCheck; }
function ahorroReto(reto) {
  let t2 = 0;
  for (let i = 1; i <= reto.checks.length; i++) t2 += importeCheck(reto, i);
  return t2;
}
function ahorroRetoDe(reto, m) {
  let t2 = 0;
  reto.checks.forEach((c, i) => { if (c.miembro === m) t2 += importeCheck(reto, i + 1); });
  return t2;
}
function metaAhorroReto(reto) {
  let t2 = 0;
  for (let i = 1; i <= reto.checksMeta; i++) t2 += importeCheck(reto, i);
  return t2;
}
function yaCheckeoHoy(reto, m) {
  const h = hoyISO();
  return reto.checks.some(c => c.fecha === h && c.miembro === m);
}
function ahorradoJuntos() {
  let t2 = 0;
  for (const o of estado.objetivos) t2 += aportadoMeta(o);
  for (const r of estado.retos) {
    if (r.estado === 'activo' || (r.estado === 'completado' && !r.objetivoId)) t2 += ahorroReto(r);
  }
  return t2;
}
function rachaDias() {
  const dias = new Set();
  estado.retos.forEach(r => r.checks.forEach(c => dias.add(c.fecha)));
  if (!dias.size) return 0;
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const d = new Date();
  if (!dias.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- recurrentes ---------- */
function materializarRecurrentes() {
  let creados = 0;
  const hoy = hoyISO();
  for (const r of estado.recurrentes) {
    if (!r.activo) continue;
    let seguro = 0;
    while (r.proxima <= hoy && seguro < 24) {
      const pl = r.plantilla;
      estado.gastos.push({
        id: uid(), grupoId: r.grupoId, desc: pl.desc, importe: pl.importe,
        moneda: (grupo(r.grupoId) || {}).moneda || 'EUR', importeOriginal: pl.importe, tasa: 1,
        pagadoPor: pl.pagadoPor, partes: Object.assign({}, pl.partes),
        reparto: pl.reparto, categoria: pl.categoria, fecha: r.proxima, items: [], mod: ahora()
      });
      r.proxima = sumarFrecuencia(r.proxima, r.frecuencia);
      r.mod = ahora();
      creados++; seguro++;
    }
  }
  if (creados) guardar();
  return creados;
}

/* ---------- CSV ---------- */
function parsearCSV(texto, moneda) {
  const lineas = texto.split(/\r?\n/).filter(l => l.trim());
  if (!lineas.length) return [];
  const sep = (lineas[0].match(/;/g) || []).length >= (lineas[0].match(/,/g) || []).length
    ? ';' : ((lineas[0].match(/\t/g) || []).length ? '\t' : ',');
  const filas = [];
  for (const linea of lineas) {
    const celdas = linea.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    if (celdas.length < 2) continue;
    let fecha = null, importe = null, desc = [];
    for (const c of celdas) {
      if (fecha == null) {
        const f = normalizarFecha(c);
        if (f) { fecha = f; continue; }
      }
      if (importe == null) {
        const v = parseImporteMon(c, moneda);
        if (v != null && v !== 0 && /\d/.test(c) && !/[a-zA-Z]{3,}/.test(c)) { importe = Math.abs(v); continue; }
      }
      if (c) desc.push(c);
    }
    if (importe != null && importe > 0) {
      filas.push({ fecha: fecha || hoyISO(), importe, desc: desc.join(' ').slice(0, 60) || '·' });
    }
  }
  return filas.slice(0, 500);
}
function normalizarFecha(s) {
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(s);
  if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
  return null;
}

/* ---------- arranque del núcleo ---------- */
cargarDisp();
estado = cargar();
try {
  if (!localStorage.getItem(CLAVE)) localStorage.setItem(CLAVE, JSON.stringify(estado));
} catch (_) {}
window.idiomaActual = estado.ajustes.idioma
  || (window.I18N[(navigator.language || 'es').slice(0, 2)] ? (navigator.language || 'es').slice(0, 2) : 'es');
