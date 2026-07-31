# UX Plan — Kanam's Solitaires

## Fase 1: Timer

- [ ] Agregar timer al state del juego (startTime, elapsed)
- [ ] Mostrar timer en la score bar (formato MM:SS)
- [ ] Timer corre desde el primer movimiento
- [ ] Timer se pausa al ganar
- [ ] Timer se resetea al hacer New Game

## Fase 2: Estadísticas (localStorage)

- [ ] Crear `src/lib/stats.js` — módulo de estadísticas
- [ ] Guardar por juego: partidas jugadas, ganadas, mejor tiempo, mejor score, promedio de movimientos
- [ ] Guardar por draw mode (1 y 3 separados)
- [ ] Mostrar estadísticas al ganar (en el banner o en un panel)
- [ ] Botón para ver estadísticas (toggle panel)
- [ ] Botón para resetear estadísticas

## Fase 3: Hint / Sugerencia

- [ ] Agregar `findHint(state)` en la lógica del juego
  - [ ] Buscar waste → foundation
  - [ ] Buscar tableau top → foundation
  - [ ] Buscar waste → tableau
  - [ ] Buscar tableau run → tableau
- [ ] Botón "💡 Hint" en la bottom bar
- [ ] Highlight visual de la carta origen y el destino
- [ ] Límite de hints por partida (opcional)

## Fase 4: Animaciones de movimiento

- [ ] En lugar de rerender completo, mutar el DOM con transiciones CSS
- [ ] Animación de carta moviéndose de waste a foundation
- [ ] Animación de carta moviéndose entre columnas
- [ ] Animación de carta dándose vuelta (flip)
- [ ] Animación de auto-complete (cartas volando a foundations)
- [ ] Transiciones suaves con `requestAnimationFrame` o CSS `transition`

## Fase 5: Sonido

- [ ] Crear `src/lib/sound.js` — módulo de sonido
- [ ] Sonidos: click de carta, slide, flip, drop en foundation, victoria
- [ ] Generar sonidos con Web Audio API (sin archivos externos)
- [ ] Toggle de sonido en el header
- [ ] Sonido desactivado por defecto (o recordar preferencia en localStorage)

## Fase 6: Vegas Scoring

- [ ] Agregar scoring mode al state: 'standard' | 'vegas'
- [ ] Standard: +10 por foundation, +5 por flip
- [ ] Vegas: empezás con -52, ganás +5 por cada carta en foundation
- [ ] Selector de scoring mode al empezar partida (junto con draw mode)
- [ ] Mostrar scoring mode en la score bar

## Fase 7: Modal de confirmación

- [ ] Crear `src/lib/modal.js` — modal reutilizable
- [ ] Reemplazar `confirm()` de New Game con modal custom
- [ ] Estilo consistente con el tema del juego
- [ ] Modal para "¿Empezar nueva partida? Se perderá el progreso actual."

---

# Visual Plan — Kanam's Solitaires

Desde el estado visual actual (cartas con gradiente, dorso con patrón, fondo felt con textura, score bar, drag-over highlight).

## Fase V1: Cartas más lindas

- [ ] Reemplazar texto de palos en el centro con SVG inline de los 4 palos
  - ♠ espadas: diseño clásico con base
  - ♥ corazones: curva más natural
  - ♦ diamantes: rombo con sombra interior
  - ♣ tréboles: tres círculos con tallo
- [ ] Sombra más realista en las cartas (box-shadow multicapa)
- [ ] Borde redondeado más suave (8px)
- [ ] Efecto de relieve en el frente (gradiente más sutil)
- [ ] Dorso con patrón de diamante/escocés en vez de stripes

## Fase V2: Mesa y felt

- [ ] Textura de felt más realista (CSS noise + SVG filter)
- [ ] Sombra de las pilas en el felt (carta fantasma debajo)
- [ ] Borde de la mesa (efecto de marco o tapete)
- [ ] Espacio entre columnas con separadores sutiles

## Fase V3: Animaciones visuales

- [ ] Transición al dar vuelta una carta (flip 3D con perspective)
- [ ] Carta se eleva al hacer hover (translateY negativo + sombra más grande)
- [ ] Carta se agranda ligeramente al arrastrar
- [ ] Efecto de "resplandor" en la foundation cuando una carta encaja
- [ ] Partículas/confeti al ganar (opcional, con CSS)

## Fase V4: Layout y espaciado

- [ ] Ajustar proporciones para que el tablero se vea equilibrado
- [ ] Las columnas del tableau deben verse centradas respecto a stock/waste/foundations
- [ ] Mejorar el espaciado en la score bar
- [ ] Header más compacto en desktop
- [ ] Transiciones suaves al cambiar de juego (fade)

## Fase V5: Detalles premium

- [ ] Cursor personalizado para cartas (grab/grabbing)
- [ ] Scrollbar custom para el game container
- [ ] Efecto de brillo en el borde de la carta al hacer hover
- [ ] Animación de entrada al cargar el juego (cartas se reparten)
- [ ] Modo oscuro toggle (opcional, el actual ya es oscuro pero podría tener variante más clara)
