/* ============================================================
   KOAPLIT — sincronización entre móviles por "sala"
   - Transporte: MQTT sobre WSS (brokers públicos) o Firestore
     si existe window.__firebase (firebase-config.js del usuario).
   - Privacidad: TODO el contenido viaja cifrado AES-GCM-256 con
     clave derivada del código de sala (PBKDF2). El broker solo
     ve bytes opacos.
   - Fusión: última escritura gana por entidad (campo mod) +
     lápidas para borrados + unión de checks y aportes.
   ============================================================ */
'use strict';

(function () {
  const BROKERS = [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://test.mosquitto.org:8081/mqtt'
  ];
  const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  let cliente = null;
  let fsUnsub = null;
  let claveCrypto = null;
  let timerEnvio = null;
  let brokerIdx = 0;
  let ultimoHashRecibido = null;
  const dispId = (function () {
    if (!disp.dispId) { disp.dispId = uid(); guardarDisp(); }
    return disp.dispId;
  })();

  const SYNC = window.SYNC = {
    estado: 'sin-sala', // sin-sala | conectando | conectado | desconectado
    programarEnvio, crearSala, unirseSala, salirSala, iniciar,
    _interno: { fusionar: (...a) => fusionar(...a), aplicarRemoto: (...a) => aplicarRemoto(...a) }
  };

  function codigoNuevo() {
    let c = '';
    const arr = new Uint32Array(6);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 6; i++) c += ALFABETO[arr[i] % ALFABETO.length];
    return c;
  }
  function normalizarCodigo(c) {
    return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  }

  /* ---------- criptografía ---------- */
  async function derivarClave(codigo) {
    const enc = new TextEncoder();
    const material = await crypto.subtle.importKey('raw', enc.encode('koaplit·' + codigo), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('koaplit-sala-v2'), iterations: 120000, hash: 'SHA-256' },
      material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }
  async function cifrar(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const datos = new TextEncoder().encode(JSON.stringify(obj));
    const caja = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, claveCrypto, datos);
    return b64(iv) + '.' + b64(new Uint8Array(caja));
  }
  async function descifrar(texto) {
    const [ivB, cajaB] = String(texto).split('.');
    if (!ivB || !cajaB) throw new Error('formato');
    const datos = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: deB64(ivB) }, claveCrypto, deB64(cajaB)
    );
    return JSON.parse(new TextDecoder().decode(datos));
  }
  function b64(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function deB64(s) {
    const bin = atob(s);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  /* ---------- fusión de estados ---------- */
  function hashEstado(e) {
    // huella barata y estable (sin el mod global)
    const copia = Object.assign({}, e, { mod: 0 });
    const s = JSON.stringify(copia);
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return h + ':' + s.length;
  }

  function fusionar(local, remotoBruto) {
    const remoto = sanearEstado(remotoBruto);
    const res = estadoInicial();

    // lápidas: unión, más nueva gana
    res.borrados = Object.assign({}, local.borrados);
    for (const [id, cuando] of Object.entries(remoto.borrados)) {
      if (!res.borrados[id] || res.borrados[id] < cuando) res.borrados[id] = cuando;
    }
    const borradoDespuesDe = (id, mod) => res.borrados[id] && res.borrados[id] > mod;

    // ajustes: gana el mod más nuevo
    res.ajustes = (remoto.ajustes.mod > local.ajustes.mod) ? remoto.ajustes : local.ajustes;

    const porId = lista => {
      const m = new Map();
      for (const x of lista) m.set(x.id, x);
      return m;
    };
    const fusionaColeccion = (clave, combinar) => {
      const a = porId(local[clave]), b = porId(remoto[clave]);
      const ids = new Set([...a.keys(), ...b.keys()]);
      const salida = [];
      for (const id of ids) {
        const x = a.get(id), y = b.get(id);
        let elegido;
        if (x && y) elegido = combinar ? combinar(x, y) : (y.mod > x.mod ? y : x);
        else elegido = x || y;
        if (!borradoDespuesDe(id, elegido.mod)) salida.push(elegido);
      }
      return salida;
    };

    res.personas = fusionaColeccion('personas');
    res.grupos = fusionaColeccion('grupos');
    res.gastos = fusionaColeccion('gastos');
    res.pagos = fusionaColeccion('pagos');
    res.recurrentes = fusionaColeccion('recurrentes');

    // objetivos: LWW de campos + unión de aportes por id
    res.objetivos = fusionaColeccion('objetivos', (x, y) => {
      const base = y.mod > x.mod ? Object.assign({}, y) : Object.assign({}, x);
      const ids = new Set();
      base.aportes = [];
      for (const a2 of [...x.aportes, ...y.aportes]) {
        if (!ids.has(a2.id)) { ids.add(a2.id); base.aportes.push(a2); }
      }
      if (!base.completadoEl && aportadoMeta(base) >= base.meta) base.completadoEl = ahora();
      return base;
    });

    // retos: LWW de campos + unión de checks por (fecha,miembro)
    res.retos = fusionaColeccion('retos', (x, y) => {
      const base = y.mod > x.mod ? Object.assign({}, y) : Object.assign({}, x);
      const vistos = new Set();
      const checks = [];
      for (const c of [...x.checks, ...y.checks]) {
        const k = c.fecha + '·' + c.miembro;
        if (!vistos.has(k)) { vistos.add(k); checks.push(c); }
      }
      checks.sort((p, q) => p.fecha.localeCompare(q.fecha));
      base.checks = checks.slice(0, 400);
      return base;
    });

    res.mod = local.mod > remoto.mod ? local.mod : remoto.mod;
    return sanearEstado(res);
  }

  function aplicarRemoto(remotoBruto) {
    try {
      const antes = hashEstado(estado);
      const fusionado = fusionar(estado, remotoBruto);
      const despues = hashEstado(fusionado);
      const hashRemoto = hashEstado(sanearEstado(remotoBruto));
      ultimoHashRecibido = hashRemoto;
      if (despues !== antes) {
        estado = fusionado;
        try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (_) {}
        if (typeof render === 'function') render();
      }
      // si tras fusionar tenemos algo que el remoto no tiene, publicamos
      if (despues !== hashRemoto) programarEnvio();
    } catch (_) {}
  }

  /* ---------- publicación ---------- */
  function programarEnvio() {
    if (!disp.sala || SYNC.estado === 'sin-sala') return;
    clearTimeout(timerEnvio);
    timerEnvio = setTimeout(publicar, 900);
  }

  async function publicar() {
    if (!disp.sala || !claveCrypto) return;
    try {
      const sobre = await cifrar({ origen: dispId, enviado: ahora(), estado });
      if (window.__firebase) {
        const db = window.__firebase.db;
        await db.collection('salas').doc(disp.sala).set({ datos: sobre, mod: estado.mod });
      } else if (cliente && cliente.connected) {
        cliente.publish(topic(), sobre, { retain: true, qos: 0 });
      }
    } catch (_) {}
  }

  const topic = () => 'koaplit/v2/' + disp.sala;

  /* ---------- conexión ---------- */
  function ponerEstado(s) {
    SYNC.estado = s;
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.hidden = false;
    if (s === 'conectado') { el.textContent = t('sincronizado'); el.style.color = '#8f8'; }
    else if (s === 'conectando') { el.textContent = t('conectando'); el.style.color = '#fd6'; }
    else if (s === 'desconectado') { el.textContent = t('sinConexion'); el.style.color = '#aab'; }
    else { el.textContent = t('soloLocal'); el.style.color = '#778'; }
  }

  async function conectar(codigo) {
    desconectar();
    disp.sala = codigo;
    guardarDisp();
    ponerEstado('conectando');
    claveCrypto = await derivarClave(codigo);

    if (window.__firebase) {
      const db = window.__firebase.db;
      fsUnsub = db.collection('salas').doc(codigo).onSnapshot(async snap => {
        ponerEstado('conectado');
        const d = snap.data();
        if (d && d.datos) {
          try {
            const sobre = await descifrar(d.datos);
            if (sobre.origen !== dispId) aplicarRemoto(sobre.estado);
          } catch (_) {}
        }
      }, () => ponerEstado('desconectado'));
      programarEnvio();
      return;
    }

    if (!window.mqtt) { ponerEstado('desconectado'); return; }
    const url = BROKERS[brokerIdx % BROKERS.length];
    cliente = window.mqtt.connect(url, {
      clientId: 'koaplit_' + dispId + '_' + Math.random().toString(16).slice(2, 8),
      clean: true, connectTimeout: 8000, reconnectPeriod: 4000, keepalive: 45
    });
    let intentosBroker = 0;
    cliente.on('connect', () => {
      ponerEstado('conectado');
      cliente.subscribe(topic(), { qos: 0 });
      programarEnvio();
    });
    cliente.on('message', async (top, mensaje) => {
      if (top !== topic()) return;
      try {
        const sobre = await descifrar(mensaje.toString());
        if (sobre.origen !== dispId) aplicarRemoto(sobre.estado);
      } catch (_) {}
    });
    cliente.on('close', () => { if (disp.sala) ponerEstado('desconectado'); });
    cliente.on('error', () => {
      intentosBroker++;
      if (intentosBroker >= 2 && brokerIdx < BROKERS.length - 1) {
        brokerIdx++;
        const cod = disp.sala;
        desconectar();
        disp.sala = cod;
        conectar(cod);
      }
    });
  }

  function desconectar() {
    if (cliente) { try { cliente.end(true); } catch (_) {} cliente = null; }
    if (fsUnsub) { try { fsUnsub(); } catch (_) {} fsUnsub = null; }
  }

  /* ---------- API pública ---------- */
  async function crearSala() {
    const codigo = codigoNuevo();
    await conectar(codigo);
    return codigo;
  }
  async function unirseSala(codigoBruto) {
    const codigo = normalizarCodigo(codigoBruto);
    if (codigo.length !== 6) return null;
    await conectar(codigo);
    return codigo;
  }
  function salirSala() {
    desconectar();
    disp.sala = null;
    guardarDisp();
    ponerEstado('sin-sala');
  }
  function iniciar() {
    if (disp.sala) conectar(disp.sala);
    else ponerEstado('sin-sala');
  }
})();
