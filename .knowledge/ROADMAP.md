# Roadmap — Kanam's Solitaires

> Estado actual: 4 juegos implementados (Klondike, Spider, FreeCell, Pyramid). Bugs críticos de undo resueltos. Pendiente: pulido, tests, accesibilidad, PWA y variantes.

---

## Principios

1. **Una sola pasada.** Cada feature se piensa, diseña, implementa y cierra.
2. **"Done" claro.** No se avanza hasta que está completo.
3. **Código existente no se toca dos veces.** Refactor solo dentro del feature que lo requiere.
4. **Prioridad: jugabilidad correcta > accesibilidad > pulido visual > más variantes.**

---

## Hito 5 — Multi-juego (completado)

- [x] Arquitectura multi-juego con `gameRegistry.js`
- [x] Klondike, Spider, FreeCell, Pyramid registrados
- [x] Cada juego en `src/games/<name>/` con `index.js`, `logic.js`, `renderer.js`
- [x] Opciones por juego (draw mode, scoring mode, dificultad)
- [x] Nav dinámica
- [x] Bugs de undo corregidos en todos los juegos

---

## Reglas oficiales vs implementación actual

### Klondike
- **Estándar:** 7 columnas, draw 1 o 3, foundations A→K por palo, tableau K→A alternando colores, fondación→tablaú permitido en variantes relajadas.
- **Implementación actual:** draw 1/3, standard/vegas scoring, foundation→tableau permitido, undo, hint, auto-complete.
- **Variantes a agregar:** Relaxed (permite cualquier carta en columna vacía), Strict (no foundation→tableau).

### Spider
- **Estándar:** 2 mazos, 10 columnas, 6×6 + 4×5 deal, draw 10, runs K→A del mismo palo para retirar, movimiento solo por rango descendente (sin restricción de palo para apilar).
- **Implementación actual:** 1/2/4 palos (corregido), draw 10, runs K→A detectadas, undo corregido.
- **Variantes a agregar:** Relaxed (permitir apilar mismo palo solo), Strict (no undo), contador de runs completadas visibles.

### FreeCell
- **Estándar:** 8 columnas (4×7 + 4×6), 4 free cells, 4 foundations, alternar colores en tableau, fórmula de supermove `(free cells + 1) × 2^empty_columns`.
- **Implementación actual:** alternar colores, fórmula simplificada `2^(free cells + 1)`, undo corregido.
- **Variantes a agregar:** Baker's Game (mismo palo en tableau en vez de alternar colores), fórmula de supermove correcta, Easy (siempre winnable deals).

### Pyramid
- **Estándar:** 28 cartas en pirámide, 24 en stock, pares que suman 13, K solo, solo cartas expuestas.
- **Implementación actual:** reglas estándar, undo, hint, auto-complete.
- **Variantes a agregar:** Relaxed Pyramid (permitir emparejar cartas no expuestas), scoring por tiempo.

---

## Hito 6 — Pulido y personalización

### 6.0 Corregir bugs restantes (highest priority)
- [ ] Verificar que undo no pierda cartas en ningún juego tras múltiples movimientos
- [ ] Verificar que `__spiderState__`, `__freecellState__` se remuevan del build final
- [ ] Revisar que los `id` de cartas no se repitan (FreeCell usaba nombres de palo + rango, únicos por mazo; Spider usa índices de copia)

### 6.1 Responsive + botonera vertical (highest UI priority)
- [ ] Rehacer botonera inferior como columna vertical flotante/derecha sin ocupar ancho del tablero
- [ ] Ancho mínimo por columna de carta que no se solape en pantallas medianas
- [ ] Escala proporcional de cartas según viewport (CSS clamp / scale)
- [ ] Layout que funcione en ventanas no maximizadas (ej. 900px, 700px)
- [ ] Tap targets mínimos 44×44 en móvil
- [ ] Evitar solapamiento de columnas en Spider (10 cols) y FreeCell (8 cols)

### 6.2 Personalización de reglas por juego
**Objetivo:** permitir al usuario elegir variantes desde el header de opciones.

- [ ] **Klondike:**
  - Relaxed mode (cualquier rey en columna vacía vs solo K)
  - Strict mode (no foundation→tableau)
  - Draw 1 / Draw 3
  - Standard / Vegas scoring
- [ ] **Spider:**
  - 1 / 2 / 4 suits
  - Mostrar contador de runs completadas (0/8)
  - Opción: permitir mover runs solo si son mismo palo (más estricta)
- [ ] **FreeCell:**
  - Classic (alternar colores)
  - Baker's Game (mismo palo en tableau)
  - Supermove fórmula real: `(freeCells + 1) * 2^emptyColumns`
- [ ] **Pyramid:**
  - Classic (solo expuestas)
  - Relaxed (cualquier carta visible)
  - Scoring por tiempo restante
**Objetivo:** permitir al usuario elegir variantes desde el header de opciones.

- [ ] **Klondike:**
  - Relaxed mode (cualquier rey en columna vacía vs solo K)
  - Strict mode (no foundation→tableau)
  - Draw 1 / Draw 3
  - Standard / Vegas scoring
- [ ] **Spider:**
  - 1 / 2 / 4 suits
  - Mostrar contador de runs completadas (0/8)
  - Opción: permitir mover runs solo si son mismo palo (más estricta)
- [ ] **FreeCell:**
  - Classic (alternar colores)
  - Baker's Game (mismo palo en tableau)
  - Supermove fórmula real: `(freeCells + 1) * 2^emptyColumns`
- [ ] **Pyramid:**
  - Classic (solo expuestas)
  - Relaxed (cualquier carta visible)
  - Scoring por tiempo restante

### 6.2 UI/UX refinada
- [ ] Animaciones de movimiento consistentes entre juegos (no solo full rebuild)
- [ ] Estado visual de selección más claro
- [ ] Mejoras de responsive en móvil (columnas más angostas, tap targets)
- [ ] Opción de card back selectable (al menos 2 diseños)

### 6.3 Accesibilidad
- [ ] Aria labels en cartas, columnas y botones
- [ ] Navegación por teclado (tab + enter/espacio)
- [ ] Focus management visible
- [ ] Contraste de colores verificado

### 6.4 Sonido
- [ ] Volumen ajustable
- [ ] Sonidos individuales on/off (slide, foundation, victory)
- [ ] Mantener off por default

### 6.5 Tests
- [ ] `vitest` + `happy-dom`
- [ ] Tests de lógica para cada juego (creación, movimientos, undo, win)
- [ ] Pre-commit hook con `simple-git-hooks`

### 6.6 Lighthouse
- [ ] Score ≥ 90 en Performance, Accessibility, Best Practices
- [ ] SEO básico para juego web

### 6.7 PWA
- [ ] Manifest
- [ ] Service worker con `vite-plugin-pwa`
- [ ] Iconos 192/512

### 6.8 Persistencia
- [ ] Guardar partida en curso por juego (localStorage)
- [ ] Resumir al volver

### 6.9 Custom domain (opcional)
- [ ] Comprar dominio
- [ ] Configurar CNAME en GitHub Pages

---

## Hito 7 — Nuevos juegos (futuro)

- [ ] Yukon (similar a Klondike pero todas las cartas visibles y movimiento libre de grupos)
- [ ] TriPeaks
- [ ] Golf
- [ ] Canfield / Forty Thieves

---

## Justificación del cambio

Se descubrió que los bugs de undo eran críticos y afectaban la confiabilidad de todos los juegos. Por eso se prioriza:

1. **Stabilidad:** cerrar definitivamente bugs de undo y reglas.
2. **Personalización:** agregar variantes conocidas (Relaxed, Baker's Game) que aumentan replayability sin inventar reglas.
3. **Accesibilidad:** Gonzalo tiene especialización activa en a11y; el producto debe reflejarlo.
4. **Tests + pre-commit hooks:** regla de proyecto obligatoria, no negociable.
5. **PWA:** mejora experiencia móvil, que ya es un constraint declarado.
6. **Más juegos:** solo después de que los 4 actuales sean sólidos y accesibles.
