/* KOAPLIT — gráficos SVG (sin dependencias) */
'use strict';

const PALETA_GRAFICOS = ['#6FF5C8', '#7FC4FF', '#FF9A7B', '#FFD37A', '#B89CFF', '#8FE388', '#FF8FB1', '#9AD9E8', '#E8C39A'];

/* Barras: gasto por mes (últimos 6 meses) */
function graficoBarrasMeses(porMes, moneda) {
  const meses = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const f = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const ym = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0');
    meses.push({ ym, etiqueta: f.toLocaleDateString(window.idiomaActual, { month: 'short' }), valor: porMes[ym] || 0 });
  }
  const max = Math.max(1, ...meses.map(m => m.valor));
  const W = 320, H = 150, margen = 6, baseY = H - 24;
  const anchoBarra = (W - margen * 2) / meses.length - 10;
  let barras = '';
  meses.forEach((m, i) => {
    const x = margen + i * ((W - margen * 2) / meses.length) + 5;
    const h = Math.round((baseY - 26) * m.valor / max);
    const y = baseY - h;
    const activa = i === meses.length - 1;
    barras += `
      <rect x="${x}" y="${y}" width="${anchoBarra}" height="${Math.max(2, h)}" rx="6"
        fill="${activa ? 'url(#gradBarra)' : 'rgba(127,196,255,.35)'}"/>
      ${m.valor > 0 ? `<text x="${x + anchoBarra / 2}" y="${y - 6}" text-anchor="middle" font-size="9.5"
        fill="${activa ? '#6FF5C8' : '#93A7C0'}" font-family="IBM Plex Mono, monospace">${fmtCorto(m.valor, moneda)}</text>` : ''}
      <text x="${x + anchoBarra / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="#93A7C0">${esc(m.etiqueta)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" style="width:100%;height:auto">
    <defs><linearGradient id="gradBarra" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6FF5C8"/><stop offset="100%" stop-color="#7FC4FF"/>
    </linearGradient></defs>
    <line x1="${margen}" y1="${baseY}" x2="${W - margen}" y2="${baseY}" stroke="rgba(143,163,188,.25)" stroke-width="1"/>
    ${barras}
  </svg>`;
}

/* Donut: gasto por categoría, con leyenda */
function graficoDonutCategorias(porCategoria, moneda, nombreCat) {
  const entradas = Object.entries(porCategoria).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
  if (!entradas.length) return '';
  const total = entradas.reduce((s, e) => s + e[1], 0);
  const R = 52, r = 32, CX = 70, CY = 70;
  let inicio = -Math.PI / 2;
  let arcos = '';
  entradas.forEach(([cat, valor], i) => {
    const ang = valor / total * Math.PI * 2;
    const fin = inicio + ang;
    const color = PALETA_GRAFICOS[i % PALETA_GRAFICOS.length];
    if (entradas.length === 1) {
      arcos += `<circle cx="${CX}" cy="${CY}" r="${(R + r) / 2}" fill="none" stroke="${color}" stroke-width="${R - r}"/>`;
    } else {
      const grande = ang > Math.PI ? 1 : 0;
      const x1 = CX + R * Math.cos(inicio), y1 = CY + R * Math.sin(inicio);
      const x2 = CX + R * Math.cos(fin), y2 = CY + R * Math.sin(fin);
      const x3 = CX + r * Math.cos(fin), y3 = CY + r * Math.sin(fin);
      const x4 = CX + r * Math.cos(inicio), y4 = CY + r * Math.sin(inicio);
      arcos += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${grande} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}
        L${x3.toFixed(1)} ${y3.toFixed(1)} A${r} ${r} 0 ${grande} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z"
        fill="${color}" stroke="#101E33" stroke-width="1.5"/>`;
    }
    inicio = fin;
  });
  const leyenda = entradas.map(([cat, valor], i) => `
    <div style="display:flex;align-items:center;gap:8px;font-size:13px;padding:3px 0">
      <i style="width:10px;height:10px;border-radius:3px;flex:none;background:${PALETA_GRAFICOS[i % PALETA_GRAFICOS.length]}"></i>
      <span style="flex:1;color:var(--bruma);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(cat)} ${esc(nombreCat(cat))}</span>
      <b style="font-family:var(--fuente-num);font-size:12.5px">${fmtMon(valor, moneda)}</b>
      <span style="color:var(--bruma);font-size:11px;width:34px;text-align:right">${Math.round(valor / total * 100)}%</span>
    </div>`).join('');
  return `<div style="display:flex;align-items:center;gap:14px">
    <svg viewBox="0 0 140 140" role="img" style="width:130px;flex:none">
      ${arcos}
      <text x="${CX}" y="${CY + 4}" text-anchor="middle" font-size="12" fill="#F2F7FB" font-family="IBM Plex Mono, monospace">${fmtCorto(total, moneda)}</text>
    </svg>
    <div style="flex:1;min-width:0">${leyenda}</div>
  </div>`;
}

/* formato compacto: 1,2k € */
function fmtCorto(minor, moneda) {
  const v = minor / factorMoneda(moneda);
  let simbolo = '';
  try {
    const partes = new Intl.NumberFormat('es-ES', { style: 'currency', currency: moneda }).formatToParts(0);
    const p = partes.find(x => x.type === 'currency');
    simbolo = p ? p.value : moneda;
  } catch (_) { simbolo = moneda; }
  if (v >= 10000) return Math.round(v / 1000) + 'k' + simbolo;
  if (v >= 1000) return (v / 1000).toFixed(1).replace('.', ',').replace(',0', '') + 'k' + simbolo;
  return Math.round(v) + simbolo;
}
