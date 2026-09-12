/**
 * Extension Icon Generator
 *
 * Generates the required Chrome extension icon sizes from a source logo.
 * The output is rounded to match the extension icon treatment Chrome expects.
 *
 * Usage:
 *   npm run generate-icons
 *   npx tsx scripts/generate-icons.tsx --source public/logo.png --output extensions/rapidtoolset/public
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const REQUIRED_ICON_SIZES = [16, 32, 48, 128] as const;

export interface GenerateIconOptions {
  sourcePath: string;
  outputDir: string;
  sizes?: readonly number[];
  background?: string;
  cornerRadiusRatio?: number;
}

const ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_SOURCE = path.join(ROOT, "public", "logo.png");
const DEFAULT_OUTPUT_DIR = path.join(
  ROOT,
  "extensions",
  "rapidtoolset",
  "public",
);

function parseArgs(argv: string[]) {
  const options: Partial<GenerateIconOptions> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--source" && next) {
      options.sourcePath = path.resolve(ROOT, next);
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.outputDir = path.resolve(ROOT, next);
      index += 1;
      continue;
    }

    if (arg === "--sizes" && next) {
      options.sizes = next
        .split(",")
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0);
      index += 1;
      continue;
    }

    if (arg === "--background" && next) {
      options.background = next;
      index += 1;
      continue;
    }

    if (arg === "--radius" && next) {
      const radius = Number.parseFloat(next);
      if (Number.isFinite(radius) && radius > 0) {
        options.cornerRadiusRatio = radius;
      }
      index += 1;
    }
  }

  return options;
}

function buildRoundedMask(size: number, radius: number): Buffer {
  const safeRadius = Math.max(0, Math.min(radius, Math.floor(size / 2)));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${safeRadius}" ry="${safeRadius}" fill="#ffffff" />
    </svg>
  `;

  return Buffer.from(svg);
}

export async function generateIconSet(options: GenerateIconOptions) {
  const sizes = options.sizes?.length ? options.sizes : REQUIRED_ICON_SIZES;
  const background = options.background ?? "#000000";
  const cornerRadiusRatio = options.cornerRadiusRatio ?? 0.22;

  if (!fs.existsSync(options.sourcePath)) {
    throw new Error(`Source logo not found: ${options.sourcePath}`);
  }

  fs.mkdirSync(options.outputDir, { recursive: true });

  await Promise.all(
    sizes.map(async (size) => {
      const radius = Math.round(size * cornerRadiusRatio);
      const icon = await sharp(options.sourcePath)
        .resize(size, size, {
          fit: "contain",
          background,
        })
        .ensureAlpha()
        .composite([
          {
            input: buildRoundedMask(size, radius),
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer();

      await sharp(icon).toFile(path.join(options.outputDir, `icon${size}.png`));
    }),
  );

  console.log(
    `Generated ${sizes.length} icon(s) from ${path.relative(ROOT, options.sourcePath)} → ${path.relative(ROOT, options.outputDir)}`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await generateIconSet({
    sourcePath: args.sourcePath ?? DEFAULT_SOURCE,
    outputDir: args.outputDir ?? DEFAULT_OUTPUT_DIR,
    sizes: args.sizes,
    background: args.background,
    cornerRadiusRatio: args.cornerRadiusRatio,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
