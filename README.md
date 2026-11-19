# TwinBench Desktop — build instructions

This folder is a ready-to-build Electron wrapper around the TwinBench
digital twin app. Because of network restrictions in the environment this
was generated in, the final .exe could not be compiled there — you'll
build it yourself with one command, which takes about 2-3 minutes.

## Prerequisites
- A Windows, Mac, or Linux machine (Windows recommended since we're
  targeting a .exe)
- Node.js 18+ installed: https://nodejs.org (LTS version, just click through
  the installer)

## Build the .exe

Open a terminal / Command Prompt in this folder and run:

```
npm install
npm run dist:win
```

The first command installs dependencies (including Electron itself).
The second builds the React app and packages it into a single portable
Windows executable.

When it finishes, look in the `release/` folder for:

```
TwinBench 1.0.0.exe
```

That's a **portable exe** — no installer, no admin rights needed. Just
double-click it (or copy it to any Windows machine) and it opens as a
normal desktop app window.

## If something goes wrong

- "npm not recognized" → Node.js isn't installed or you need to restart
  your terminal after installing it.
- Build fails partway → delete the `node_modules` folder and `release`
  folder and re-run `npm install` then `npm run dist:win`.
- Want a Mac/Linux app instead? Run `npx electron-builder --mac` or
  `npx electron-builder --linux` after `npm run build`.

## Just want to try it without building an exe?

Run:
```
npm install
npm run dev
```
This opens the app instantly in a normal browser tab at the printed
localhost address — same app, just not packaged as a standalone .exe.
