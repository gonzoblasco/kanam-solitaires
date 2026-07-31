# Roadmap — Kanam's Solitaires

> Estado actual: Klondike funcional. Draw 1/3, undo, auto-complete, drag & drop, doble click, foundation→tableau, score/moves, responsive básico, waste preview, score bar, bottom bar, draw mode selector.

---

## Principios de esta etapa

1. **Una sola pasada de desarrollo.** No iteramos sobre lo mismo. Cada feature se piensa, se diseña, se implementa y se cierra.
2. **Cada feature tiene un "done" claro.** No se avanza a la siguiente hasta que la anterior está completa.
3. **El código existente no se toca dos veces.** Si hay que refactorizar, se hace dentro del feature que lo requiere, no como tarea separada.
4. **Prioridad: jugabilidad > visual > sonido > más juegos.** Primero que se juegue bien, después que se vea bien, después que suene bien, después más variedad.

---

## Hito 1 — Jugabilidad (ahora)

**Objetivo:** Klondike se siente completo como juego. Tiene todo lo que un solitario debería tener.

### 1.1 Timer
- **Qué:** Reloj que mide el tiempo de partida.
- **Cómo:**
  - `state.startTime` se setea en el primer movimiento (no al crear el juego)
  - `state.elapsed` se actualiza con `setInterval` cada segundo, fuera del snapshot de undo
  - Display `MM:SS` en la score bar
  - Se pausa al ganar, se resetea en New Game
- **Done:** El timer aparece en la score bar, corre desde el primer click, se pausa al ganar, se resetea en New Game. No se rompe con undo.

### 1.2 Hint
- **Qué:** Botón que sugiere un movimiento posible.
- **Cómo:**
  - `findHint(state)` en klondike.js — busca en orden: waste→foundation, tableau top→foundation, waste→tableau, tableau run→tableau
  - Devuelve `{ source, dest }` o `null`
  - Botón 💡 Hint en bottom bar
  - Highlight visual: la carta origen se marca con clase `.hint-source`, el destino con `.hint-target`
  - El highlight dura hasta el próximo movimiento
- **Done:** El botón existe, muestra un hint válido cuando hay uno, no muestra nada cuando no hay. El highlight se ve claro.

### 1.3 Vegas Scoring
- **Qué:** Modo de puntuación alternativo (el de los casinos).
- **Cómo:**
  - `state.scoringMode: 'standard' | 'vegas'`
  - Standard: +10 foundation, +5 flip
  - Vegas: empieza en -52, +5 por carta en foundation, 0 por flip
  - Selector en el header junto a Draw mode (Standard / Vegas)
  - Se muestra en la score bar
- **Done:** Se puede elegir Standard o Vegas al empezar. El score se calcula correctamente en cada modo. Se muestra en la barra.

### 1.4 Modal de confirmación
- **Qué:** Reemplazar `confirm()` nativo con un modal lindo.
- **Cómo:**
  - `src/lib/modal.js` — función `showModal({ title, message, confirmText, cancelText, onConfirm })`
  - Overlay semitransparente + card centrada
  - Estilo consistente con el tema (verde oscuro, dorado)
  - Se usa en New Game y donde haga falta
- **Done:** New Game muestra el modal en vez de `confirm()`. El modal se ve bien, es responsive, se cierra con botón o click fuera.

### 1.5 Estadísticas
- **Qué:** Guardar y mostrar estadísticas de partidas.
- **Cómo:**
  - `src/lib/stats.js` — API sobre localStorage
  - Guarda por juego + draw mode: `{ played, won, bestTime, bestScore, totalMoves }`
  - Al ganar: se actualizan stats y se muestran en el banner
  - Botón 📊 Stats en bottom bar que abre panel overlay
  - Botón para resetear stats (con confirmación)
- **Done:** Las stats persisten entre sesiones. Se ven al ganar y en el panel. Se pueden resetear.

---

## Hito 2 — Visual premium

**Objetivo:** El juego se ve bien en cualquier pantalla. Las cartas tienen personalidad.

### 2.1 Cartas SVG
- **Qué:** Los palos en el centro de las cartas pasan de texto Unicode a SVG inline.
- **Cómo:**
  - 4 SVGs (♠ ♥ ♦ ♣) diseñados a mano en `src/lib/suits.js`
  - Cada SVG es un string exportable, ~200 bytes cada uno
  - `createCardElement` usa el SVG en vez de texto en `.card-center`
  - Sombra multicapa más realista (3 capas de box-shadow)
  - Dorso con patrón de diamante/escocés (CSS repeating conic-gradient o similar)
- **Done:** Las cartas se ven notablemente mejor. Los palos son dibujos, no texto. El dorso tiene patrón.

### 2.2 Mesa y felt
- **Qué:** El fondo se siente más como una mesa de juego.
- **Cómo:**
  - SVG filter para textura noise en el felt
  - Sombra de las pilas (pseudo-elemento debajo de cada columna)
  - Borde de la mesa (inset shadow en el game container)
- **Done:** El fondo tiene textura visible. Las pilas proyectan sombra en el felt. Hay un marco que separa la mesa del header.

### 2.3 Animaciones visuales
- **Qué:** Pequeñas animaciones que hacen el juego más vivo.
- **Cómo:**
  - Flip 3D al dar vuelta carta (CSS `perspective` + `rotateY` + `backface-visibility`)
  - Carta se eleva en hover (`translateY(-4px)` + sombra más grande)
  - Resplandor en foundation cuando recibe una carta (`box-shadow` animado con `@keyframes`)
  - Confeti al ganar (10-15 partículas CSS con `@keyframes` random)
- **Done:** Las animaciones existen, son sutiles, no interfieren con la jugabilidad.

### 2.4 Layout y espaciado
- **Qué:** El tablero se ve equilibrado en todos los tamaños.
- **Cómo:**
  - Ajustar proporciones: top row ocupa ~30% del ancho, tableau ~70%
  - Header más compacto en desktop (menos padding)
  - Transición fade al cambiar de juego (opacity 0→1 con 200ms)
- **Done:** El tablero se ve proporcionado. No hay espacios raros ni elementos desalineados.

### 2.5 Detalles premium
- **Qué:** Pequeños toques que marcan la diferencia.
- **Cómo:**
  - Cursor `grab` / `grabbing` en cartas arrastrables
  - Scrollbar custom (webkit scrollbar styles)
  - Brillo en borde de carta al hover (`box-shadow` con color dorado)
  - Animación de repartir al empezar (cartas caen una por una con delay)
- **Done:** Se siente premium. Los detalles están pero no son invasivos.

---

## Hito 3 — Sonido

**Objetivo:** Feedback auditivo sutil que mejora la experiencia.

### 3.1 Web Audio API
- **Qué:** Sonidos generados proceduralmente, sin archivos externos.
- **Cómo:**
  - `src/lib/sound.js` — usa `AudioContext` + `OscillatorNode` + `GainNode`
  - Sonidos: click (corta, aguda), slide (barrido descendente), flip (chasquido), drop foundation (campana), victoria (acorde ascendente)
  - Toggle 🔇/🔊 en el header, preferencia en localStorage
  - Sonido desactivado por defecto
- **Done:** Los sonidos existen, se escuchan bien, se pueden activar/desactivar. No hay archivos externos.

---

## Hito 4 — Animaciones de movimiento

**Objetivo:** Las cartas se mueven suavemente en vez de aparecer/desaparecer.

### 4.1 Mutación DOM con transiciones
- **Qué:** En lugar de rerender completo, mover las cartas con CSS transitions.
- **Cómo:**
  - Identificar qué carta(s) se mueven y a dónde
  - Clonar el elemento DOM, calcular posición con `getBoundingClientRect`
  - Aplicar `transform: translate(dx, dy)` con CSS transition
  - Al terminar la transición, rerender normal
  - Auto-complete: cartas vuelan secuencialmente a foundations con delay escalonado
- **Done:** Mover una carta se ve suave. Auto-complete muestra las cartas volando una por una.

---

## Hito 5 — Próximos juegos

**Objetivo:** La colección tiene más de un juego.

### 5.1 Arquitectura multi-juego
- **Qué:** Refactor para que agregar un juego nuevo sea trivial.
- **Cómo:**
  - Cada juego exporta: `{ name, init(container), destroy(), getState() }`
  - `main.js` maneja el lifecycle: destroy del juego actual → init del nuevo
  - Los juegos comparten `src/lib/card.js` y `src/lib/dom.js`
- **Done:** Se puede agregar un juego nuevo creando una carpeta en `src/games/` y registrándolo en `main.js`.

### 5.2 Spider Solitaire
- **Qué:** El segundo juego de la colección.
- **Cómo:**
  - 2 barajas (104 cartas)
  - 10 columnas: 6 con 6 cartas (5 ocultas), 4 con 5 cartas (4 ocultas)
  - Se completan secuencias de K→A del mismo palo
  - Dificultad: 1 palo (fácil), 2 palos (medio), 4 palos (difícil)
  - Draw: 10 cartas a la vez desde el stock
- **Done:** Spider es jugable. Tiene selector de dificultad. Draw, undo, auto-complete funcionan.

### 5.3 FreeCell
- **Qué:** Tercer juego.
- **Cómo:**
  - 8 columnas, 4 free cells, 4 foundations
  - Todas las cartas visibles
  - Runs se mueven completas sin restricción de color
  - Número de cartas movibles = 2^(free cells libres)
- **Done:** FreeCell es jugable. Las reglas de movimiento de runs están implementadas.

### 5.4 Pyramid
- **Qué:** Cuarto juego.
- **Cómo:**
  - Pirámide de 28 cartas (7 filas)
  - Emparejar cartas que sumen 13 (A=1, J=11, Q=12, K=13)
  - K se puede eliminar solo
  - Waste para el mazo restante
- **Done:** Pyramid es jugable. Las parejas se pueden seleccionar. Draw funciona.

---

## Hito 6 — Pulido final

**Objetivo:** El proyecto está listo para mostrarlo.

### 6.1 Tests
- **Qué:** Tests unitarios de la lógica de cada juego.
- **Cómo:**
  - `vitest` + `happy-dom`
  - Tests para: creación de mazo, shuffle, validación de movimientos, undo, win condition
  - Pre-commit hook con `vitest run`
- **Done:** `npm test` pasa. Los tests cubren la lógica crítica.

### 6.2 Lighthouse
- **Qué:** Auditoría de performance y accesibilidad.
- **Cómo:**
  - Correr Lighthouse en producción
  - Arreglar issues de accesibilidad (aria labels, focus management, contraste)
  - Performance: lazy loading no aplica (es todo chico), pero verificar que no haya reflows innecesarios
- **Done:** Lighthouse score ≥ 90 en todas las categorías.

### 6.3 PWA (opcional)
- **Qué:** Manifest + service worker para jugar offline.
- **Cómo:**
  - `public/manifest.json`
  - Service worker con `vite-plugin-pwa`
  - Iconos en `public/icons/`
- **Done:** Se puede instalar como app en el celular. Juega offline.

### 6.4 Custom domain (opcional)
- **Qué:** Un dominio lindo para la colección.
- **Cómo:**
  - Comprar dominio (ej: kanam.cards, solitaires.app)
  - Configurar CNAME en GitHub Pages
- **Done:** La colección tiene su propio dominio.
