interface BrandIconProps {
  /** Height in pixels (default: 24) */
  size?: number;
}

// The website's logo bolt, from src/components/brand-icon/brand-bolt.ts in
// rapid-tool-set: copy both values from there when the logo changes
const BOLT_WIDTH = 62.23;
const BOLT_PATH =
  "M36.22 1.25A170.43 170.43 0 0 0 0.46 54.44Q-1.19 58.31 3.01 58.51A170.43 170.43 0 0 0 19.96 58.45Q23.02 58.29 22.69 61.34A170.43 170.43 0 0 0 22.58 97.54Q23.02 101.76 26 98.75A170.43 170.43 0 0 0 61.76 45.56Q63.41 41.69 59.21 41.49A170.43 170.43 0 0 0 42.26 41.55Q39.2 41.71 39.53 38.66A170.43 170.43 0 0 0 39.64 2.46Q39.21 -1.76 36.22 1.25Z";

/**
 * The RapidToolSet lightning bolt, as shown in the website's header. Inlined
 * (rather than an <img>) so the fill inherits `currentColor` and follows the
 * light/dark theme.
 */
export default function BrandIcon({ size = 24 }: BrandIconProps) {
  return (
    <svg
      width={(size * BOLT_WIDTH) / 100}
      height={size}
      viewBox={`0 0 ${BOLT_WIDTH} 100`}
      role="img"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path fill="currentColor" d={BOLT_PATH} />
    </svg>
  );
}
