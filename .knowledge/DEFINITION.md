# DEFINITION — Kanam's Solitaires

## What it is

A browser-based collection of classic solitaire card games. Primary goal: play Klondike, Spider, FreeCell and Pyramid on desktop and mobile, offline-capable, with clean rules and good UX.

## What it is not

- Not a casino / betting app.
- Not a multiplayer game.
- Not a generic card-engine framework; it ships concrete games.

## Target audience

- Jugadores casuales que quieren solitario clásico en el navegador.
- Gonzo como portfolio de a11y + PWA + vanilla JS sin frameworks.

## Scope (v1.0.0)

- 4 juegos: Klondike, Spider, FreeCell, Pyramid.
- Variantes de reglas configurables por juego.
- Persistencia de partidas por juego en localStorage.
- Estadísticas locales por modo.
- Sonido opcional.
- PWA instalable.
- Responsive hasta 375px.

## Out of scope (v1.0.0)

- Cuentas / backend.
- Multiplayer.
- Animaciones complejas de carta volando entre pilas.
- Resolver Performance Lighthouse ≥ 90 (CLS) quedó como deuda conocida.

## Success criteria

- Cada juego termina partidas sin errores.
- Undo no pierde cartas.
- Se puede resumir una partida tras cerrar la pestaña.
- PWA se instala en Android/iOS.
- Lighthouse A/BP/S ≥ 90 (Performance aceptado ≥ 80 por ahora).

## Tech constraints

- Vanilla JS + Vite.
- Sin dependencias de runtime.
- localStorage solo para stats y save state.
- GitHub Pages para hosting.
