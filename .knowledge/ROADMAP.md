# Roadmap — Kanam's Solitaires

> Estado actual: **v1.0.0** — 4 juegos implementados y jugables (Klondike, Spider, FreeCell, Pyramid). Persistencia, PWA, sonido, estadísticas, accesibilidad y tests listos. Pendiente: cerrar Performance ≥ 90 en Lighthouse (CLS) y expandir catálogo de juegos.

---

## Principios

1. **Una sola pasada.** Cada feature se piensa, diseña, implementa y cierra.
2. **"Done" claro.** No se avanza hasta que está completo.
3. **Código existente no se toca dos veces.** Refactor solo dentro del feature que lo requiere.
4. **Prioridad: jugabilidad correcta > accesibilidad > pulido visual > más variantes.**

---

## Reglas oficiales vs implementación actual

### Klondike
- **Estándar:** 7 columnas, draw 1 o 3, foundations A→K por palo, tableau K→A alternando colores.
- **Implementación actual:** draw 1/3, standard/vegas scoring, foundation→tableau permitido (relajado), undo, hint, auto-complete.
- **Variantes actuales:** Relaxed (cualquier carta en columna vacía), Strict (no foundation→tableau).

### Spider
- **Estándar:** 2 mazos, 10 columnas, 6×6 + 4×5 deal, draw 10, runs K→A del mismo palo para retirar.
- **Implementación actual:** 1/2/4 palos, draw 10, runs K→A detectadas, undo, hint, auto-complete.
- **Variantes actuales:** Classic, Strict (solo se pueden mover runs completas del mismo palo).

### FreeCell
- **Estándar:** 8 columnas (4×7 + 4×6), 4 free cells, 4 foundations, alternar colores en tableau.
- **Implementación actual:** alternar colores, supermove simplificado, undo.
- **Variantes actuales:** Classic, Baker's Game (mismo palo en tableau).

### Pyramid
- **Estándar:** 28 cartas en pirámide, 24 en stock, pares que suman 13, K solo, solo cartas expuestas.
- **Implementación actual:** reglas estándar, undo, hint, auto-complete.
- **Variantes actuales:** Classic (solo expuestas), Relaxed (cualquier carta visible).

---

## Hito 5 — Multi-juego (completado)

- [x] Arquitectura multi-juego con `gameRegistry.js`
- [x] Klondike, Spider, FreeCell, Pyramid registrados
- [x] Cada juego en `src/games/<name>/` con `index.js`, `logic.js`, `renderer.js`
- [x] Opciones por juego
- [x] Nav dinámica
- [x] Bugs de undo corregidos en todos los juegos

---

## Hito 6 — Pulido y personalización

### 6.0 Bugs restantes
- [x] Undo no pierde cartas en ningún juego
- [x] Variables de debug removidas del build
- [x] IDs de carta únicos
- [x] Timer arranca en creación de partida
- [x] Timer display sin saltos
- [x] Partida abandonada contada al apretar "New Game"

### 6.1 Responsive + botonera vertical
- [x] Botonera vertical derecha
- [x] Responsive hasta móvil pequeño
- [x] Tap targets ≥ 44×44
- [x] Sin solapamiento en Spider/FreeCell

### 6.2 Personalización de reglas
- [x] Klondike: draw 1/3, standard/vegas, relaxed/strict
- [x] Spider: 1/2/4 suits, classic/strict
- [x] FreeCell: classic, baker's game
- [x] Pyramid: classic, relaxed

### 6.3 UI/UX refinada
- [x] Animaciones de reparto
- [x] Selección visual clara
- [x] Responsive móvil
- [x] Opción de card back

### 6.4 Accesibilidad
- [x] Aria labels en cartas, columnas y botones
- [x] Navegación por teclado
- [x] Focus visible
- [x] Contraste verificado

### 6.5 Sonido
- [x] Web Audio API sounds
- [x] Volumen global
- [x] Toggles por tipo
- [x] Off por default

### 6.6 Tests y quality gates
- [x] vitest + happy-dom
- [x] Tests de lógica por juego
- [x] Pre-commit hook con Biome + tests + build

### 6.7 Lighthouse
- [x] SEO 100
- [x] Accessibility 100
- [x] Best Practices 100
- [~] Performance 80 — bloqueado por CLS 0.42 del renderizado inicial de `#game-container`.

### 6.8 PWA
- [x] Manifest e iconos 192/512
- [x] Service worker con cache de shell
- [x] Registro correcto

### 6.9 Persistencia
- [x] Guardar partida por juego en localStorage
- [x] Resumir al volver
- [x] Limpiar slot en New Game / win

### 6.10 Custom domain (opcional)
- [ ] Comprar dominio
- [ ] Configurar CNAME en GitHub Pages

---

## Hito 7 — Nuevos juegos (futuro)

- [ ] Yukon (todas visibles, movimiento libre de grupos)
- [ ] TriPeaks
- [ ] Golf
- [ ] Canfield / Forty Thieves

---

## Notas de versión

### v1.0.0 — 2026-08-01
- Lanzamiento inicial con 4 juegos completos.
- PWA, persistencia, sonido, estadísticas, accesibilidad.
- Lighthouse A/BP/S en 100, Performance 80 por CLS pendiente.
