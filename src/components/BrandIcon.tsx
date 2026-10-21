interface BrandIconProps {
  /** Width and height in pixels (default: 24) */
  size?: number;
}

/**
 * The RapidToolSet lightning bolt, as shown in the website's header. Inlined
 * (rather than an <img>) so the fill inherits `currentColor` and follows the
 * light/dark theme.
 */
export default function BrandIcon({ size = 24 }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path fill="currentColor" d="M52 0 L18 56 H50 L42 100 L82 44 H48 Z" />
    </svg>
  );
}
