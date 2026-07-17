# 🐨 KOAPLIT v2

**Gastos a medias, sueños enteros.** App para parejas (y sus grupos): gastos compartidos estilo Splitwise, retos de ahorro, metas comunes, sincronización entre móviles y escaneo de tickets.

## Funciones

- **Gastos**: igual / exacto / porcentaje / cuotas / todo a uno, con participantes seleccionables, categorías, búsqueda, totales y gráficos.
- **Grupos y amigos**: la pareja + los grupos que queráis (viajes, pisos, amigos), cada uno con su moneda base.
- **Saldos y simplificación de deudas**: plan mínimo de pagos en grupos, saldar con método de pago (efectivo, Bizum, transferencia, PayPal con enlace paypal.me, tarjeta).
- **Multi-divisa**: 300+ monedas (Intl), conversión con tasas del BCE cuando hay conexión (frankfurter.dev) y tasa editable a mano.
- **Escaneo de tickets**: OCR en el propio móvil (Tesseract, español, servido en local — la foto no sale del dispositivo), detecta total, fecha y líneas con desglose de artículos.
- **Gastos recurrentes**: semanal / quincenal / mensual, se generan solos al abrir la app.
- **Importar CSV**: fecha;descripción;importe (detecta separador y formato de fecha).
- **Metas** con fecha límite, aportes por persona y celebración 🎊. **Retos de ahorro** con check-ins diarios, modo fijo/creciente, racha 🔥 y volcado automático a la meta.
- **Sincronización entre móviles**: sala con código de 6 caracteres, cifrada de extremo a extremo (AES-GCM; la clave se deriva del código y nunca viaja). Sin cuentas. Funciona offline y fusiona al reconectar (última escritura gana + unión de checks/aportes + borrados propagados).
- **7 idiomas** (es, en, ca, pt, fr, de, it) · **PWA offline** · copia de seguridad JSON.

## Sincronización

1. Móvil 1: **Crear sala** → aparece un código (p. ej. `X6Z7J9`).
2. Móvil 2: escribe el código → **Unirse**.
3. Listo: todo se sincroniza en tiempo real cuando hay conexión, y al volver de estar offline.

Por defecto viaja por un broker MQTT público **con el contenido cifrado de extremo a extremo** (el broker solo ve bytes). Si prefieres tu propia nube: crea un proyecto Firebase, añade `firebase-config.js` con `export const firebaseConfig = {...}` y la app usará tu Firestore automáticamente.

## Instalar en Android

1. Sube la carpeta a un hosting estático con HTTPS (GitHub Pages, Netlify, Cloudflare Pages…).
2. Abre la URL en Chrome → menú ⋮ → **"Añadir a pantalla de inicio"**.
3. Icono en el launcher, pantalla completa, funciona sin conexión y el botón Atrás se comporta como una app nativa.

## Instalar en iPhone

Safari no tiene botón de "instalar" — el camino es manual, siempre:

1. Abre la URL en **Safari** (tiene que ser Safari, no Chrome/Firefox — en iOS todos los navegadores usan el motor de Safari por debajo, pero solo Safari expone "Añadir a pantalla de inicio").
2. Botón compartir (el cuadrado con la flecha hacia arriba) → **"Añadir a pantalla de inicio"**.
3. Queda como una app normal: icono propio, pantalla completa, sin la barra de Safari.

**Diferencias reales con Android** (limitaciones de iOS, no de la app):
- Los **avisos del sistema** (🔔 en Ajustes) solo funcionan en iOS 16.4 o más reciente, y **solo si ya la has añadido a la pantalla de inicio** — en una pestaña normal de Safari, iOS ni siquiera ofrece la opción de activarlos. El toast dentro de la app y el banner de "Novedades" al reabrir sí funcionan siempre, en cualquier versión.
- No hay vibración al hacer check-in o guardar (Apple nunca ha implementado esa API en Safari) — la app lo detecta sola y no falla, simplemente no vibra.
- Con el tema **Minimal pastel** (el único claro) la hora y la batería de arriba pueden verse con poco contraste sobre el header — es una limitación de cómo iOS pinta la barra de estado en apps instaladas, no hay forma de arreglarlo sin sacrificar la pantalla completa en el resto de temas.
- Cada persona instala la app en su propio iPhone/Android indistintamente — la sincronización por código de sala funciona igual entre cualquier combinación de plataformas.

## Desarrollo

```bash
python servidor-dev.py     # http://localhost:8321 sin caché
```

Abre `http://localhost:8321/?dev` (`dev` desactiva el service worker mientras desarrollas).

**Al publicar una versión**: sube `CACHE` en `sw.js` y el sufijo `?v=` en `index.html` y en la lista `ARCHIVOS` de `sw.js`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura, onboarding con emparejamiento, carga opcional de Firebase |
| `i18n.js` | 7 idiomas |
| `nucleo.js` | Estado, saneado profundo, migración v1→v2, dinero/divisas, repartos, balances, deudas simplificadas, recurrentes, CSV |
| `ui.js` | Vistas, hojas, acciones, botón Atrás de Android |
| `sync.js` | Salas cifradas (MQTT/Firestore), fusión LWW + lápidas |
| `ocr.js` | Lectura de tickets con Tesseract local |
| `graficos.js` | Barras y donut SVG |
| `styles.css` + `fonts.css` | Diseño "noche alpina", tipografías incrustadas |
| `sw.js` + `manifest.webmanifest` + `icons/` | PWA offline |
| `vendor/` | mqtt.js y Tesseract (todo en local, sin CDNs) |

Hecho con 🐨 para dos.
