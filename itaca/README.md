# 🏛️ ÍTACA

Un sistema para mejorar la calidad de las decisiones.

ÍTACA no es un chat, ni un dashboard, ni una herramienta de productividad. Su
objetivo es que humanos e inteligencias artificiales piensen mejor juntos.

---

## ⚠️ Este directorio está de paso

ÍTACA vive aquí temporalmente, dentro del repositorio `koaplit`, en la rama
`claude/consejo-itaca-onboarding-snrm6t` y **sin fusionar nunca a `master`**.

No es su sitio. El Consejo aprobó el alcance del Sprint 1 pero no llegó a
decidir dónde vive el repositorio, y esta rama era el único almacenamiento
duradero disponible: el entorno de trabajo es un contenedor efímero y todo lo
que no se empuja se pierde. `C:\ITACA` es una ruta local, inalcanzable desde
aquí, y en la cuenta no existe ningún repositorio `itaca`.

Para sacarlo a su repositorio propio, conservando el historial:

```bash
git subtree split --prefix=itaca -b itaca-solo
# crear naixsaint-rgb/itaca vacío en GitHub, y después:
git push git@github.com:naixsaint-rgb/itaca.git itaca-solo:main
```

O, si el Sprint 0 local ya tiene historial que valga la pena, copiar solo el
contenido de `itaca/` encima de él.

Una vez movido, borrar este directorio y esta rama.

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
estado, sin kit de UI, sin librería de animación, sin fuentes ni imágenes
externas. La escenografía es SVG dibujado a mano: 0 KB de red.

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
| `docs/decisiones/` | Actas **generadas**. No editar a mano. |
| `scripts/` | `verificar` (invariantes) y `generar-actas` (Mnemósine). |

## La Sala del Consejo

Sin scroll — nunca, en ninguna resolución. La unidad de diseño es `--u`, que
vale exactamente 1 px a 1920×1080 y escala de forma uniforme: la sala es la
misma sala, más pequeña. Verificada a 1366×768, 1440×900, 1920×1080 y
2560×1440.

El único elemento que puede desbordar es el panel de lectura inferior, porque
los argumentos del Consejo no tienen longitud acotada y truncarlos sería peor.
La sala se queda quieta; el texto se lee.

Se mueve una sola cosa en toda la sala: la luz, cada 32 segundos, muy poco.
Con `prefers-reduced-motion`, nada.

**Teclado**: `←` `→` giran alrededor de la mesa · `1`–`5` sientan directamente ·
`Esc` devuelve a la resolución.

---

## Deuda técnica conocida

- El estado de la sala vive en `useState`. En cuanto haya más de una decisión
  navegable habrá que decidir cómo se selecciona, y esa es una decisión de
  arquitectura, no un detalle de implementación.
- Las posiciones de Atenea y Mnemósine en ÍTACA-0001 están **reconstruidas**
  desde el documento de incorporación, no transcritas. Quedan pendientes de
  ratificación por Odiseo. El aviso está en el propio archivo de datos.
