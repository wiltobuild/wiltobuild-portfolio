# DOOM shareware and emulator provenance

The unmodified `doom19s.zip` is id Software's DOOM 1.9 shareware distribution, downloaded from https://www.gamers.org/pub/idgames/idstuff/doom/doom19s.zip. It contains the complete shareware episode and its original documentation. The browser unpacks it in memory; the registered game from the reference portfolio is not redistributed.

The emulator is js-dos 7.3.9 (GPL-2.0), as used by Henry Heffernan's reference implementation. Runtime files are unmodified from https://registry.npmjs.org/js-dos/-/js-dos-7.3.9.tgz. License: ../vendor/js-dos/LICENSE. Source and source maps: https://github.com/caiiiycuk/js-dos and the versioned npm archive; DOSBox backend source: https://github.com/caiiiycuk/dosbox. Reference: https://github.com/henryjeff/portfolio-inner-site/blob/23cf84acd5c76d2c719e1d04c3d976dc4b0b49f8/src/components/applications/Doom.tsx.

ZIP decoding uses fflate 0.8.2 (MIT), unmodified from https://registry.npmjs.org/fflate/-/fflate-0.8.2.tgz. License: ../vendor/fflate-LICENSE. Source: https://github.com/101arrowz/fflate/tree/v0.8.2.
`wlibzip.js` and `wlibzip.wasm` are from the matching emulators 0.73.3 npm package: https://registry.npmjs.org/emulators/-/emulators-0.73.3.tgz.
