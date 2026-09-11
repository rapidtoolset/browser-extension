# RapidToolSet

Discover and launch web tools, with i18n support. Built with [WXT](https://wxt.dev/), React 19, TypeScript, and Tailwind CSS v4.

[Chrome](https://chromewebstore.google.com/detail/tool-hub/njmnbhbdgnbkjknnmfhinhbbpjpcclld) · [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tool-hub/)

## Requirements

- Node.js 20+
- npm 10+

## Getting started

```bash
npm install
```

## Running in dev mode

The browser launches automatically with the extension loaded and hot-reload enabled.

```bash
npm run dev
```

To target a specific browser, pass it through WXT:

```bash
npm run dev -- -b firefox
```

## Building for production

```bash
npm run build
npm run zip
```

The zip is produced under `.output/`.

## Shared components

UI primitives (buttons, dropdowns, etc.) come from [shadcn/ui](https://ui.shadcn.com/) and live in [src/components/ui/](src/components/ui/). Higher-level shared widgets like `ExtensionHeader`, `PopupContainer`, and `EmptyState` live in [src/components/](src/components/).

## Icons

Extension icons (16, 32, 48, 128 px) and promo tiles are auto-generated. Output goes to `extensions/rapidtoolset/public/`.

```bash
npm run generate-icons
npm run generate-promo-tiles
```

Override initials in [scripts/generate-icons.ts](scripts/generate-icons.ts) via `INITIALS_OVERRIDE`.

## Key libraries


- [WXT](https://wxt.dev/) — extension framework (manifest, entrypoints, dev server, cross-browser)
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)

## License

GPL-3.0. See [LICENSE](LICENSE).
