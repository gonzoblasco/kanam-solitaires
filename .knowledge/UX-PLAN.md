# UX Plan — Kanam's Solitaires

> **Status:** Most phases implemented in v1.0.0. Future work is mostly polish and new games.

---

## Fase 1: Timer ✅

- [x] Timer en state del juego (`startTime`, `elapsed`, `timerRunning`)
- [x] Timer visible en score bar
- [x] Timer arranca en creación de partida
- [x] Timer se pausa al ganar
- [x] Timer se resetea en New Game

---

## Fase 2: Estadísticas ✅

- [x] `src/lib/stats.js` — módulo de estadísticas
- [x] Guardar por juego y modo: jugadas, ganadas, mejor tiempo, mejor score
- [x] Mostrar estadísticas al ganar
- [x] Botón para ver panel de estadísticas

---

## Fase 3: Hint / Sugerencia ✅

- [x] `findHint(state)` en lógica de cada juego
- [x] Botón "💡 Hint"
- [x] Highlight visual de origen y destino

---

## Fase 4: Animaciones de movimiento ✅ (parcial)

- [x] Animación de reparto (dealing)
- [x] Highlight de selección y drop
- [ ] Animación de carta moviéndose entre pilas sin full rebuild (deuda opcional)
- [ ] Animación de auto-complete volando a foundations (deuda opcional)

---

## Fase 5: Sonido ✅

- [x] `src/lib/sound.js` con Web Audio API
- [x] Sonidos: click, slide, flip, foundation, victory
- [x] Toggle master y por tipo
- [x] Volumen ajustable
- [x] Persistencia en localStorage, off por default

---

## Fase 6: Vegas Scoring ✅

- [x] Selector de scoring mode
- [x] Standard scoring
- [x] Vegas scoring

---

## Fase 7: Modal de confirmación ✅

- [x] `src/lib/modal.js`
- [x] Modal de New Game sin `confirm()` nativo

---

# Visual Plan

## Fase V1: Cartas más lindas ✅

- [x] SVG de palos
- [x] Sombra y relieve
- [x] Dorso con patrón

## Fase V2: Mesa y felt ✅

- [x] Felt texturizado
- [x] Layout equilibrado
- [x] Botonera vertical derecha

## Fase V3: Animaciones visuales (parcial)

- [x] Carta se eleva al hover
- [x] Confeti al ganar
- [ ] Flip 3D al dar vuelta (deuda opcional)

## Fase V4: Layout y espaciado ✅

- [x] Proporciones adaptativas
- [x] Responsive hasta móvil pequeño

## Fase V5: Detalles premium (futuro)

- [ ] Cursor grab/grabbing personalizado
- [ ] Modo claro / oscuro toggle
