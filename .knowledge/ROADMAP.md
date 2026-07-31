# Roadmap — Kanam's Solitaires

> Estado actual: Klondike completo. Timer, hint, vegas scoring, modal, stats, SVG cards, felt texture, animaciones, sonido, movimiento animado.

---

## Principios

1. **Una sola pasada.** Cada feature se piensa, diseña, implementa y cierra.
2. **"Done" claro.** No se avanza hasta que está completo.
3. **Código existente no se toca dos veces.** Refactor solo dentro del feature que lo requiere.
4. **Prioridad: jugabilidad > visual > sonido > más juegos.**

---

## Hito 5 — Próximos juegos

**Objetivo:** La colección tiene 4 juegos jugables con estándar de calidad consistente.

### 5.0 Arquitectura multi-juego (fundación)

- [ ] Refactor `main.js` para lifecycle de juegos: `init(container, options)`, `destroy()`
- [ ] Cada juego en `src/games/<name>/` con `index.js`, `logic.js`, `renderer.js`
- [ ] Sistema de opciones por juego (draw mode, scoring mode, dificultad)
- [ ] Nav dinámica: los juegos se registran, no se hardcodean
- [ ] Los juegos comparten `src/lib/card.js`, `src/lib/dom.js`, `src/lib/suits.js`, `src/lib/sound.js`, `src/lib/modal.js`, `src/lib/stats.js`
- **Done:** Agregar un juego nuevo = crear carpeta + registrar en array.

---

### 5.1 Spider Solitaire

**Fase 5.1.1 — Lógica del juego**
- [ ] `spider/logic.js`:
  - [ ] `createSpider(difficulty)` — 1, 2, o 4 palos
  - [ ] 2 barajas (104 cartas), 10 columnas
  - [ ] Deal: 6 cartas en cols 0-5 (5 ocultas), 5 cartas en cols 6-9 (4 ocultas)
  - [ ] `drawStock(state)` — reparte 10 cartas (1 por columna)
  - [ ] `canMoveToColumn(card, column)` — solo importa el palo si difficulty > 1
  - [ ] `getRunStart(column, cardIndex)` — secuencia K→A del mismo palo
  - [ ] `moveRun(state, srcCol, cardIndex, dstCol)`
  - [ ] `completeRun(state, colIndex)` — cuando una columna tiene K→A completo, se retira
  - [ ] `isGameWon(state)` — todas las runs completadas
  - [ ] `findHint(state)` — sugerencia de movimiento
  - [ ] `autoComplete(state)` — mover runs completas
  - [ ] `undo(state)` — snapshot stack
  - [ ] Timer, score tracking

**Fase 5.1.2 — Renderer**
- [ ] `spider/renderer.js`:
  - [ ] Layout: 10 columnas, stock arriba a la izquierda
  - [ ] Cartas se superponen 20px
  - [ ] Drag & drop entre columnas
  - [ ] Doble click: auto-move a columna posible
  - [ ] Hint highlight
  - [ ] Score bar: timer, score, moves
  - [ ] Bottom bar: undo, hint, auto, new game
  - [ ] Animaciones de movimiento (reutilizar sistema de klondike)
  - [ ] Sonidos (reutilizar sound.js)
  - [ ] Win banner con stats

**Fase 5.1.3 — Integración**
- [ ] `spider/index.js` — entry point
- [ ] Registrar en `main.js` con opción de dificultad
- [ ] Selector de dificultad en el header (1 palo / 2 palos / 4 palos)
- [ ] Stats separados por dificultad
- **Done:** Spider es completamente jugable con las 3 dificultades.

---

### 5.2 FreeCell

**Fase 5.2.1 — Lógica del juego**
- [ ] `freecell/logic.js`:
  - [ ] `createFreeCell()` — 52 cartas, todas visibles
  - [ ] 8 columnas (6 con 7 cartas, 2 con 6 cartas)
  - [ ] 4 free cells (espacios temporales, 1 carta cada uno)
  - [ ] 4 foundations (A→K por palo)
  - [ ] `canMoveToFreeCell(card, freeCells)` — máximo 1 por celda
  - [ ] `canMoveToFoundation(card, foundation)`
  - [ ] `canMoveToColumn(card, column)` — runs descendentes, alternando colores
  - [ ] `getMovableCount(freeCells)` — 2^(free cells libres) cartas movibles
  - [ ] `getRunStart(column, cardIndex, maxCount)` — run válida dentro del límite
  - [ ] `moveRun(state, srcCol, cardIndex, dstCol)`
  - [ ] `moveToFreeCell(state, colIndex, cellIndex)`
  - [ ] `moveFromFreeCell(state, cellIndex, dstCol)`
  - [ ] `freeCellToFoundation(state, cellIndex, foundationIndex)`
  - [ ] `isGameWon(state)`
  - [ ] `findHint(state)`
  - [ ] `undo(state)`
  - [ ] Timer, score tracking

**Fase 5.2.2 — Renderer**
- [ ] `freecell/renderer.js`:
  - [ ] Layout: 4 free cells arriba, 4 foundations al lado, 8 columnas abajo
  - [ ] Todas las cartas visibles (sin face-down)
  - [ ] Drag & drop entre: columnas, free cells, foundations
  - [ ] Doble click: auto-move a foundation
  - [ ] Hint highlight
  - [ ] Score bar, bottom bar
  - [ ] Animaciones, sonidos, win banner

**Fase 5.2.3 — Integración**
- [ ] `freecell/index.js`
- [ ] Registrar en `main.js`
- **Done:** FreeCell es completamente jugable.

---

### 5.3 Pyramid

**Fase 5.3.1 — Lógica del juego**
- [ ] `pyramid/logic.js`:
  - [ ] `createPyramid()` — 52 cartas
  - [ ] Pirámide de 28 cartas (7 filas: 1+2+3+4+5+6+7)
  - [ ] Cartas en la pirámide: solo las descubiertas (sin carta encima) se pueden seleccionar
  - [ ] Stock: 24 cartas restantes
  - [ ] Waste: cartas descartadas del stock
  - [ ] `selectCard(state, row, col)` — selecciona/deselecciona carta
  - [ ] `canPair(card1, card2)` — suman 13 (A=1, J=11, Q=12, K=13)
  - [ ] `removePair(state)` — elimina par seleccionado
  - [ ] `removeKing(state, row, col)` — K se elimina solo
  - [ ] `drawStock(state)` — pasa al waste
  - [ ] `isGameWon(state)` — pirámide vacía
  - [ ] `findHint(state)`
  - [ ] `undo(state)`
  - [ ] Timer, score tracking

**Fase 5.3.2 — Renderer**
- [ ] `pyramid/renderer.js`:
  - [ ] Layout: pirámide centrada, stock/waste a la izquierda
  - [ ] Click para seleccionar carta (highlight)
  - [ ] Botón "Remove" cuando hay par seleccionado
  - [ ] Doble click en K: eliminar
  - [ ] Hint highlight
  - [ ] Score bar, bottom bar
  - [ ] Animaciones, sonidos, win banner

**Fase 5.3.3 — Integración**
- [ ] `pyramid/index.js`
- [ ] Registrar en `main.js`
- **Done:** Pyramid es completamente jugable.

---

## Hito 6 — Pulido final

### 6.1 Tests
- [ ] `vitest` + `happy-dom`
- [ ] Tests de lógica para cada juego
- [ ] Pre-commit hook

### 6.2 Lighthouse
- [ ] Score ≥ 90 en todas las categorías
- [ ] Accesibilidad: aria labels, focus management, contraste

### 6.3 PWA (opcional)
- [ ] Manifest + service worker con `vite-plugin-pwa`
- [ ] Iconos

### 6.4 Custom domain (opcional)
- [ ] Comprar dominio
- [ ] Configurar CNAME en GitHub Pages
