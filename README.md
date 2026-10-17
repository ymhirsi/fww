# Faya's Wonder World

An original, mobile-first SVG exploration game for Faya. Tap the ground to walk; tap objects to approach and interact. Walk through doors between the garden, music room, bedroom and kitchen. No build tools, external assets, analytics, advertisements, quizzes or accounts.

## Play

Open https://ymhirsi.github.io/fww/ in landscape. For an app-like full screen on iPhone, open in Safari, choose Share → Add to Home Screen, then launch that icon. Browser full-screen and orientation locking vary by iOS version; the game cannot forcibly hide Safari's controls. Portrait shows a turn-phone prompt. EN / عربي changes the spoken language; both captions remain visible. Device voices determine Arabic speech availability. The sound button mutes both music and speech.

- Garden: water and replant flowers; bounce the ball.
- Music room: play 13 piano keys, sound the violin, explore furniture.
- Bedroom: carry Teddy, tuck Teddy in and pick Teddy up again; build and tumble blocks; switch the bedside light.
- Kitchen: prepare shared fruit snacks and turn on water.

World state lasts for the current session and survives room transitions. Reloading starts fresh. All artwork is original SVG authored in this repository; no Bluey characters or assets are used.

## Development

Serve this directory with any static HTTP server. GitHub Pages can serve directly from main at the repository root. Files: `index.html` (shell), `style.css` (responsive UI), `game.js` (art and game behavior), `manifest.webmanifest`, `icon.svg`.

Run `node --check game.js` and `node tests/game.test.cjs`. The dependency-free test harness checks game logic using a lightweight DOM substitute; it is not browser or visual verification.

## Audit and changes

The previous prototype referenced an undeclared `walkToken` during startup; mixed CSS and SVG transforms on the same avatar; mapped taps by element size without accounting for SVG letterboxing; scheduled overlapping room changes; reset held toys on entry; and spoke mixed-language text without setting a speech language. The landscape frame also received conflicting positioning rules.

The replacement uses a delta-time animation loop, separate facing and world-position transforms, inverse SVG screen-coordinate mapping, one pending interaction, guarded room transitions, persistent session play state, and explicit language selection. UI controls respect safe-area insets. Reduced-motion settings remove gait bounce and effect motion. Interactive objects support keyboard activation.

## Remaining device verification

Actual iPhone visual and audio testing is still required: Safari versus Home Screen launch; safe areas and rotate prompt; tap alignment at screen edges; rapid destination changes; all doors; piano latency and simultaneous touches; Arabic voice availability; returning after phone lock. A browser preview was unavailable during implementation. This is a more complete playable foundation, not a claim of console-game production polish.
