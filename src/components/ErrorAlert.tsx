import type { ReactNode } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface ErrorAlertProps {
  children: ReactNode;
  className?: string;
}

/** Compact Bootstrap danger alert with a warning icon. */
export default function ErrorAlert({ children, className }: ErrorAlertProps) {
  return (
    <div
      className={classNames(
        "alert alert-danger d-flex align-items-start gap-2 m-0 px-3 py-2 border-0 small text-start",
        className,
      )}
    >
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="flex-shrink-0 mt-1"
      />
      <span
        className="min-w-0 text-balance"
        style={{ overflowWrap: "anywhere" }}
      >
        {children}
      </span>
    </div>
  );
}
