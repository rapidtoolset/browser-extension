# RapidToolSet

Discover and launch web tools, with i18n support. Built with [WXT](https://wxt.dev/), React 19, TypeScript, and Bootstrap 5, styled to match the [RapidToolSet](https://rapidtoolset.com/) website.

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

- [src/components/](src/components/) — shared widgets (`ExtensionHeader`, `PopupContainer`, `EmptyState`, `Tabs`, …), modeled on the website's components
- [src/index.css](src/index.css) — global styles on top of Bootstrap, mostly shared with the website
- [extensions/rapidtoolset/](extensions/rapidtoolset/) — extension-specific code

## Languages

The popup follows the browser's language, in any of the website's 16 languages (English otherwise; Arabic switches it to a right-to-left layout). Its strings are in [extensions/rapidtoolset/public/\_locales/](extensions/rapidtoolset/public/_locales/), with English as the source, and the supported locales are listed in [extensions/rapidtoolset/lib/locales.ts](extensions/rapidtoolset/lib/locales.ts).

To run the dev browser in another language, pass its locale code:

```bash
WXT_RAPIDTOOLSET_LOCALE=fr npm run dev
```

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
- [Bootstrap 5](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/) and [Material Icons](https://mui.com/material-ui/material-icons/) (`@mui/icons-material`)

## License

GPL-3.0. See [LICENSE](LICENSE).
