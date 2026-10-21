import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface HeaderDropdownProps {
  /** Content rendered inside the trigger button (before the chevron) */
  triggerContent: ReactNode;
  /** ARIA label for the trigger button and the menu */
  ariaLabel: string;
  /** Minimum width of the dropdown menu */
  minWidth?: string;
  /**
   * Menu items (`role="menuitem"` elements, the selected one with the
   * `active` class). Pass a function to receive a `close()` callback.
   */
  children: ReactNode | ((close: () => void) => ReactNode);
}

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

/**
 * Header button opening a menu below it, styled like the website's
 * HeaderDropdown. Opening focuses the selected item; arrow keys, Home and End
 * move between items; Escape closes the menu and refocuses the button.
 */
export default function HeaderDropdown({
  triggerContent,
  ariaLabel,
  minWidth = "160px",
  children,
}: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const item =
      menu.querySelector<HTMLElement>(`${MENU_ITEM_SELECTOR}.active`) ??
      menu.querySelector<HTMLElement>(MENU_ITEM_SELECTOR);
    item?.focus();
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number;
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        return;
      case "Tab":
        setIsOpen(false);
        return;
      case "ArrowDown":
        next = (index + 1) % items.length;
        break;
      case "ArrowUp":
        next = (index - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  };

  return (
    <div className="position-relative">
      <button
        ref={buttonRef}
        type="button"
        className="header-button btn-reset btn-bookmark text-light-emphasis btn-highlight rounded d-inline-flex align-items-center justify-content-center gap-2"
        style={{ padding: "0 12px" }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {triggerContent}
        <KeyboardArrowDownIcon fontSize="small" style={{ opacity: 0.5 }} />
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          className="dropdown-menu show shadow-lg"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 1050,
            minWidth,
          }}
          onKeyDown={handleMenuKeyDown}
        >
          {typeof children === "function" ? children(close) : children}
        </ul>
      )}
    </div>
  );
}
