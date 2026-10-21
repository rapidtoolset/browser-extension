import {
  useRef,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface TabItem {
  key: string;
  label: ReactNode;
  /** Shown before the label */
  icon?: ReactNode;
}

interface TabsProps {
  /** Prefix for the tab and panel element ids, shared with each TabPanel */
  id: string;
  items: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const TRAY_STYLE: CSSProperties = {
  backgroundColor: "var(--bs-secondary-bg)",
  border: "var(--bs-border-width) solid var(--bs-border-color)",
};

const tabStyle = (isActive: boolean): CSSProperties => ({
  // Tabs shrink (truncating their label) rather than overflow the tray
  minWidth: 0,
  gap: "0.375rem",
  ...(isActive
    ? {
        backgroundColor: "var(--bs-body-bg)",
        color: "var(--bs-body-color)",
        transition: "color 0.15s",
      }
    : {
        backgroundColor: "transparent",
        color: "var(--bs-secondary-color)",
        transition: "color 0.15s",
      }),
});

const tabId = (id: string, key: string) => `${id}-tab-${key}`;
const panelId = (id: string, key: string) => `${id}-panel-${key}`;

/**
 * Segmented-control style tabs, matching the website's Tabs component.
 * Arrow keys (wrapping around), Home and End move focus to a tab and select it.
 */
export function Tabs({ id, items, activeTab, onTabChange }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % items.length;
        break;
      case "ArrowLeft":
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
    tabRefs.current[next]?.focus();
    onTabChange(items[next].key);
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="d-flex flex-shrink-0 rounded-2 p-1 gap-1"
      style={TRAY_STYLE}
    >
      {items.map((item, index) => {
        const isActive = item.key === activeTab;
        return (
          <button
            key={item.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            id={tabId(id, item.key)}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={panelId(id, item.key)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(item.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className="btn btn-sm fw-medium rounded-2 border-0 py-2 px-2 text-nowrap flex-fill d-inline-flex align-items-center justify-content-center"
            style={tabStyle(isActive)}
          >
            {item.icon}
            <span className="text-truncate min-w-0">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps extends ComponentProps<"div"> {
  /** The `id` of the Tabs this panel belongs to */
  tabsId: string;
  value: string;
  activeValue: string;
}

/** Renders the panel of tab `value`, only while it is the active tab. */
export function TabPanel({
  tabsId,
  value,
  activeValue,
  ...props
}: TabPanelProps) {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      id={panelId(tabsId, value)}
      aria-labelledby={tabId(tabsId, value)}
      tabIndex={0}
      {...props}
    />
  );
}
