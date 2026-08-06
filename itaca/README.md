# 🏛️ ÍTACA

Un sistema para mejorar la calidad de las decisiones.

ÍTACA no es un chat, ni un dashboard, ni una herramienta de productividad. Su
objetivo es que humanos e inteligencias artificiales piensen mejor juntos.

> El historial de este repositorio empieza en el Sprint 1. Los primeros commits
> se escribieron dentro de una rama de trabajo de otro repositorio, porque
> ÍTACA todavía no tenía casa; se extrajeron con `git subtree split`, así que
> el historial es el real y no una copia aplanada.

---

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | La sala, en desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm run verificar` | Audita que las decisiones registradas **se sostengan** |
| `npm run actas` | Regenera `docs/decisiones/` desde `src/datos/` |

Sin dependencias más allá de `react` y `react-dom`. Sin router, sin librería de
estado, sin kit de UI, sin librería de animación. **Ninguna petición a un
servidor ajeno**: la escenografía es SVG dibujado a mano y las dos tipografías
(Cormorant Garamond e Inter, ambas OFL) viven en `src/estilos/fuentes/`, 227 KB
del subconjunto latino. La sala funciona sin conexión y no le cuenta a nadie
quién la usa.

---

## La decisión fundacional

La unidad fundamental de ÍTACA **no** es el mensaje, ni la conversación, ni la
tarea, ni el proyecto. Es **la decisión deliberada**. Toda la arquitectura gira
alrededor de su ciclo de vida:

```
planteada → en deliberación → resuelta → revisable → (en deliberación)
```

`resuelta` no es terminal a propósito. Una decisión que no puede reabrirse no
es una decisión, es un dogma.

## Qué distingue una decisión deliberada

`src/dominio/decision.js` no valida datos: define, en código, qué separa una
decisión deliberada de una ocurrencia con fecha. `npm run verificar` falla si
alguna decisión registrada no cumple:

- **Dos voces como mínimo.** Una sola es un monólogo con testigos.
- **Dos posturas distintas como mínimo.** La unanimidad sin fricción significa
  que nadie ha pensado. (Por esto existirá Sócrates.)
- **Ninguna postura sin argumento.** La postura sin argumento no cuenta.
- **Al menos una alternativa descartada.** Si no se descartó nada, no se
  decidió: se reaccionó.
- **Al menos una condición de revisión.** Qué nos haría cambiar de opinión.

Estas invariantes son la Regla de Oro hecha ejecutable. Si algún día estorban,
sabremos que la decisión que protegen sigue viva.

## Estructura

| Ruta | Qué es |
|---|---|
| `src/dominio/` | El modelo. No importa nada de `src/sala/`: la dependencia va en un solo sentido. |
| `src/datos/` | La memoria del Consejo, en su única forma canónica. |
| `src/sala/` | La Sala del Consejo. Una vista sobre el dominio, nunca al revés. |
| `src/sala/geometria.js` | Dónde está cada cosa en la sala. Es geometría de la vista, no del dominio. |
| `src/estilos/fuentes/` | Cormorant Garamond e Inter (OFL), servidas desde aquí. Sin CDN. |
| `docs/decisiones/` | Actas **generadas**. No editar a mano. |
| `scripts/` | `verificar` (invariantes) y `generar-actas` (Mnemósine). |

## La Sala del Consejo

Una villa mediterránea a mediodía: artesonado de nogal, columnata toscana
abierta al mar, muro de caliza, hornacina con escultura, travertino pulido y
una mesa de mármol de 1400 unidades de ancho.

La luz entra por la columnata de la izquierda, cruza el suelo y se apaga a la
derecha: **hay una sola dirección de luz** y todos los degradados del proyecto
la obedecen. En cuanto haya una segunda, la sala volverá a sentirse interior y
cerrada.

Tres cosas hacen que se lea como arquitectura y no como ilustración, y ninguna
es el color: **rango tonal** (el nogal del techo es el ancla oscura — sin algo
profundo arriba, lo claro de abajo no se lee como luz), **fuga única** (techo,
suelo y sombras convergen en el mismo punto) y **reflejos** (una superficie que
no devuelve nada no es piedra, es relleno).

**Sin iconos.** Ni emoji ni pictogramas: un filete de bronce y el nombre en
Cormorant dicen lo mismo sin sacar a nadie de la villa.

**Al muro sube el título de la decisión; el documento vivo se queda sobre la
mesa.** La mesa no representa una decisión: es donde la decisión ocurre. La
pregunta permanece sobre el mármol durante toda la deliberación, incluso
mientras se lee a un miembro — un argumento que se lee sin la pregunta delante
deja de ser un argumento y pasa a ser una opinión.

La profundidad no es un efecto: las sillas se escalan según su distancia y las
del fondo se dibujan **antes** que la mesa, las de delante **después**. El orden
de las capas en `Sala.jsx` es literalmente la profundidad de la sala.

Sin scroll — nunca, en ninguna resolución. Todo vive en un lienzo de 1920×1080
escalado por `--u` y centrado, de modo que dibujo y texto comparten el mismo
origen de coordenadas. Verificado a 1366×768, 1440×900, 1920×1080 y 2560×1440:
desbordamiento 0 px, las cuatro esquinas del pliego dentro de la elipse de la
mesa y ninguna ficha fuera de pantalla.

El único elemento que puede desbordar es el pliego, porque los argumentos del
Consejo no tienen longitud acotada y truncarlos sería peor.

Se mueve una sola cosa: la luz, cada 34 segundos, muy poco. Con
`prefers-reduced-motion`, nada.

La sala tiene la luz que tiene: **no hay selector de tema**. Un conmutador
claro/oscuro es interfaz asomando, y la sala existe para que la tecnología
desaparezca.

**Teclado**: `←` `→` giran alrededor de la mesa · `1`–`5` sientan directamente ·
`Esc` vuelve a la resolución.

---

## Deuda técnica conocida

- El estado de la sala vive en `useState`. En cuanto haya más de una decisión
  navegable habrá que decidir cómo se selecciona, y esa es una decisión de
  arquitectura, no un detalle de implementación.
- La perspectiva es de **alzado**: el suelo fuga, pero el muro del fondo es
  plano y la arcada no está en escorzo. Las referencias del Consejo tienen un
  ábside curvo. Es alcanzable y está sin hacer.
- La figura de la hornacina derecha queda demasiado tenue, y el encuentro entre
  muro y suelo es una recta dura que cruza toda la sala.
- Sin probar en móvil ni en tableta: el requisito sigue siendo Full HD.
- Las posiciones de Atenea y Mnemósine en ÍTACA-0001 están **reconstruidas**
  desde el documento de incorporación, no transcritas. Quedan pendientes de
  ratificación por Odiseo. El aviso está en el propio archivo de datos.
