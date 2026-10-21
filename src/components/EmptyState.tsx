import type { ReactNode } from "react";
import classNames from "classnames";

interface EmptyStateProps {
  /** Icon element (size and color are standardized by EmptyState) */
  icon?: ReactNode;
  /** Primary message */
  title: ReactNode;
  /** Secondary / descriptive message */
  description?: ReactNode;
  /** Extra content such as action buttons */
  children?: ReactNode;
  /** Additional class names applied to the container */
  className?: string;
}

/** Message panel for empty lists, in the website's tinted panel style. */
export default function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={classNames(
        "bg-body-tertiary rounded d-flex flex-column align-items-center gap-2 p-4 text-center",
        className,
      )}
    >
      {icon && (
        <span className="empty-state-icon mb-1 text-body-secondary">
          {icon}
        </span>
      )}
      <p className="mb-0 fw-medium text-balance">{title}</p>
      {description && (
        <p className="mb-0 small text-body-secondary text-balance">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
