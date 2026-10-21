import classNames from "classnames";

interface SpinnerProps {
  size?: "sm";
  /** Bootstrap text color, e.g. "muted" or "primary" */
  color?: string;
  className?: string;
  /** Visually-hidden text for screen readers. Omit for decorative/inline spinners. */
  label?: string;
}

/** Bootstrap border spinner, matching the website's Spinner component. */
export default function Spinner({
  size,
  color,
  className,
  label,
}: SpinnerProps) {
  return (
    <span
      className={classNames(
        "spinner-border",
        { "spinner-border-sm": size === "sm" },
        color && `text-${color}`,
        className,
      )}
      role="status"
      aria-hidden={label ? undefined : true}
    >
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}
