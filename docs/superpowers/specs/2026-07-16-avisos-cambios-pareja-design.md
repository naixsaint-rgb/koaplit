# Avisos de cambios de la pareja — diseño

Fecha: 2026-07-16
Estado: implementado y verificado (ver notas al final)

## Contexto

KOAPLIT sincroniza entre los dos móviles de la pareja (y grupos con más
miembros) mediante una sala cifrada de extremo a extremo (MQTT, sin
servidor propio; ver [[proyecto-koaplit]]). Hoy, cuando llega un cambio
remoto, la app se repinta en silencio — no hay ningún aviso.

El usuario quiere enterarse de los cambios que hace su pareja: gastos
nuevos, pagos, aportes a metas, checks de retos, etc.

## Objetivo

Avisar de los cambios del otro dispositivo por tres canales, sin añadir
ningún servidor ni infraestructura nueva (la app sigue siendo 100%
estática y sin backend):

1. **Toast dentro de la app** cuando está visible y llega un cambio.
2. **Notificación del sistema** (Notification API) cuando la app está
   abierta en segundo plano (pestaña no visible) y el usuario dio
   permiso.
3. **Banner "Novedades"** en Inicio al reabrir la app, resumiendo lo
   que pasó desde la última vez que el usuario estuvo activo en ella.

Explícitamente fuera de alcance: notificaciones tipo push cuando la
app está completamente cerrada o el proceso del navegador ha muerto
(requeriría Web Push + servidor propio — se descartó en el diálogo
previo por complejidad/infraestructura nueva).

## Qué cuenta como "cambio interesante"

Solo eventos con valor real para la pareja (para no generar ruido):

- Gasto nuevo (no ediciones de metadatos menores)
- Pago / saldo registrado
- Aporte a una meta
- Meta conseguida
- Check-in de reto por el otro miembro
- Reto completado

Se ignoran explícitamente: cambios de nombre/emoji, cambios de moneda,
edición de grupos, cambios de ajustes. Estos synchronizan igual, solo
que no generan aviso.

## Arquitectura

Módulo nuevo y aislado: `notificaciones.js`, cargado después de
`sync.js` y antes de `ui.js` en `index.html`. Responsabilidad única:
detectar eventos remotos "interesantes" y decidir cómo avisarlos. No
conoce detalles de renderizado de `ui.js` más allá de llamar a
`toast()` (ya existente) y a una función `pintarBannerNovedades()`
que `ui.js` expone.

### Detección de cambios remotos (en `sync.js`)

`aplicarRemoto(remotoBruto)` ya calcula `antes` (estado local previo a
fusionar) y `fusionado`. Se añade una comparación estructural antes de
sustituir `estado`:

```
detectarEventos(antes, fusionado, remotoSaneado) → Evento[]
```

Regla por colección (gastos, pagos, objetivos.aportes, retos.checks,
retos.estado):

- Un ítem es "nuevo remoto" si su `id` no existe en `antes` pero sí en
  `fusionado`, y ese mismo `id` existe en `remotoSaneado` (confirma
  que vino del otro dispositivo, no que ya estuviera localmente).
- Un ítem "cambiado remoto" si existe en ambos pero el contenido de
  `fusionado` coincide con el de `remotoSaneado` y difiere del de
  `antes` (o sea: ganó la versión remota en el LWW).
- Los aportes de metas y los checks de retos son listas append-only:
  basta con diff por id/clave (`fecha·miembro` para checks).

Esta función es pura (recibe 3 estados, devuelve una lista de
eventos), así que se puede probar simulando un `remotoBruto` por
consola sin dos dispositivos reales — igual que se verificó `fusionar`
en la sesión anterior.

Cada `Evento` tiene la forma:
`{ tipo: 'gasto'|'pago'|'aporte'|'metaLograda'|'check'|'retoCompletado', texto, importe? }`
con `texto` ya construido en el idioma activo (reutiliza `t()` y los
helpers de formato de `nucleo.js`), del mismo estilo que
`ultimaActividad()` en `ui.js`.

### Reparto por canal (en `notificaciones.js`)

Para cada evento detectado:

- Si `document.visibilityState === 'visible'`: `toast(evento.texto)`
  (canal 1, reutiliza el sistema existente).
- Si no visible y `Notification.permission === 'granted'`:
  `registration.showNotification(...)` vía el service worker ya
  registrado (funciona igual desde una pestaña de fondo), con
  vibración corta si `navigator.vibrate` existe.
- Independientemente de la visibilidad: se acumula en una cola
  `disp.novedadesPendientes` (persistida en `koaplit-disp`, local, no
  sincronizada) para el banner de Inicio.

### Banner "Novedades" (en `ui.js`)

- Se añade `disp.ultimaVista` (ISO timestamp) — actualizado cuando el
  usuario ve/descarta el banner.
- Al renderizar Inicio, si `disp.novedadesPendientes.length`, se
  muestra un banner desplegable arriba de la burbuja del koala:
  *"🐰 Noa hizo 3 cosas mientras no estabas ▾"*, que al expandirse
  lista cada evento con su texto e importe.
- Un botón "✕ Descartar" limpia la cola y actualiza `ultimaVista`.

### Permiso de notificación

- No se pide en el arranque.
- La primera vez que `notificaciones.js` necesita repartir un evento
  por el canal 2 (app de fondo) y `Notification.permission === 'default'`
  (nunca preguntado), se muestra primero un toast/banner contextual
  con un botón *"🔔 Activar avisos"* que, al pulsarlo, llama a
  `Notification.requestPermission()`. Si se deniega o se ignora, no se
  vuelve a insistir automáticamente.
- Se añade un interruptor en **Ajustes** ("🔔 Avisos de la pareja")
  que refleja `Notification.permission` y permite volver a pedirlo
  manualmente si el usuario cambió de opinión (los navegadores no
  dejan re-pedir permiso denegado por JS; el interruptor explica que
  hay que activarlo desde los ajustes del navegador/Android si quedó
  bloqueado, y enlaza a él si es posible).

## Manejo de errores

- Si `Notification` no existe (navegador sin soporte) o
  `serviceWorker.getRegistration()` devuelve `undefined`, el canal 2
  se omite en silencio; los canales 1 y 3 siguen funcionando igual.
- Si `detectarEventos` lanza una excepción por datos remotos
  inesperados, se captura y se ignora esa ronda de avisos — nunca debe
  romper la fusión de estado ni el render principal (ya protegidos por
  el `try/catch` de `aplicarRemoto` y `render()`).
- Los eventos "propios" (originados por este mismo dispositivo, sin
  pasar por `aplicarRemoto`) nunca generan aviso — la detección vive
  exclusivamente en el flujo de sincronización remota.

## Pruebas

Sin dos móviles físicos disponibles en esta sesión, se verifica
simulando un `remotoBruto` por consola del navegador (mismo mecanismo
que se usó para probar `fusionar()`):

1. Con la pestaña visible: simular un gasto remoto nuevo → comprobar
   que aparece el toast con el texto correcto y que NO aparece con
   datos que ya existían localmente (evita autonotificación).
2. Con `document.visibilityState` forzado a `'hidden'` y permiso de
   notificación concedido (mock): comprobar que se llama a
   `showNotification` con el texto esperado.
3. Sin permiso concedido: comprobar que no se lanza notificación del
   sistema pero sí se acumula en `disp.novedadesPendientes`.
4. Reabrir/rerender Inicio con `novedadesPendientes` no vacío:
   comprobar que el banner aparece con el resumen correcto y que
   "Descartar" lo limpia y persiste en `koaplit-disp`.
5. Simular una meta lograda y un reto completado por control remoto:
   comprobar el texto y prioridad correctos.
6. Confirmar que cambios ignorados (editar nombre, moneda) NO generan
   ningún evento.

## Notas de implementación (2026-07-16)

Implementado sin desviaciones del diseño: `notificaciones.js` (nuevo),
hook en `sync.js:aplicarRemoto`, banner + prompt de permiso en
`ui.js:vInicio`, fila de estado en Ajustes. Las 6 pruebas del plan de
pruebas se ejecutaron en el navegador (consola) contra el flujo real
(`aplicarRemoto`, no solo funciones sueltas) y pasaron, incluyendo el
caso negativo (editar nombre no genera aviso) y el mock de
`Notification`/`document.visibilityState` para el canal de fondo.

Durante la misma sesión se añadieron dos funciones más, fuera del
alcance original de este spec:

- **Foto de portada mensual**: ver commit correspondiente. Reutiliza
  el mismo canal de sincronización cifrado sin cambios (la imagen
  comprimida — JPEG, máx. ~640px, recomprimida hasta caber en 220 000
  caracteres de dataURL — vive en `estado.portadasMes`, así que
  sincroniza gratis con el mecanismo LWW ya existente). Añade también
  un evento de tipo `portada` al sistema de avisos de este spec.
- **Total anual persistente**: `totalesGrupo()` ahora expone
  `totalAnual`/`porAno`, mostrado en la hoja de Totales. No requirió
  cambios de arquitectura — los gastos y pagos nunca se eliminan al
  saldar, así que el total ya era calculable; solo faltaba mostrarlo
  agregado por año en la UI.
