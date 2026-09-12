# RapidToolSet

Discover and launch web tools, with i18n support. Built with [WXT](https://wxt.dev/), React 19, TypeScript, and Tailwind CSS v4.

[Chrome](https://chromewebstore.google.com/detail/njmnbhbdgnbkjknnmfhinhbbpjpcclld) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/rapidtoolset/)

## Requirements

- Node.js 20+
- npm 10+

## Getting started

```bash
npm install
npm run dev                  # dev mode, launches the browser with hot-reload
npm run build                # production build
npm run zip                  # zip output for store submission (in .output/)
npm run format               # write Prettier formatting changes
npm run format:check         # verify formatting without modifying files
```

## Project layout

- [src/components/ui/](src/components/ui/) — [shadcn/ui](https://ui.shadcn.com/) primitives
- [src/components/](src/components/) — shared widgets (`ExtensionHeader`, `PopupContainer`, `EmptyState`)
- [extensions/rapidtoolset/](extensions/rapidtoolset/) — extension-specific code

## Icons

Icons and promo tiles are auto-generated into `extensions/rapidtoolset/public/` from `public/logo.png`:

```bash
npm run generate-icons
npm run generate-promo-tiles
```

Override icon generation inputs by passing `--source`, `--output`, `--sizes`, `--background`, or `--radius` to [scripts/generate-icons.tsx](scripts/generate-icons.tsx).

## Key libraries

- [WXT](https://wxt.dev/) — extension framework
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)

## License

GPL-3.0. See [LICENSE](LICENSE).
