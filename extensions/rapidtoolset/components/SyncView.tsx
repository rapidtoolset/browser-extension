import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faLink,
  faLinkSlash,
} from "@fortawesome/free-solid-svg-icons";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import { formatDistanceToNow } from "date-fns";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import { getDateFnsLocale, t } from "../lib/i18n";
import type { RemoteUser } from "../lib/types";

interface Props {
  connected: boolean;
  connecting: boolean;
  syncing: boolean;
  error: string | null;
  lastSyncedAt: number | null;
  user: RemoteUser | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

export default function SyncView(props: Props) {
  const {
    connected,
    connecting,
    syncing,
    error,
    lastSyncedAt,
    user,
    onConnect,
    onDisconnect,
    onSync,
  } = props;

  if (!connected) {
    return (
      <EmptyState icon={<CloudOutlinedIcon />} title={t("syncEmptyTitle")}>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2 mt-2"
          onClick={() => onConnect()}
          disabled={connecting}
        >
          <FontAwesomeIcon icon={faLink} />
          {connecting ? t("syncConnecting") : t("syncConnectCta")}
        </button>
        {error && <ErrorAlert className="mt-2 w-100">{error}</ErrorAlert>}
      </EmptyState>
    );
  }

  return (
    <div className="d-flex flex-column flex-grow-1 gap-3">
      <div className="bg-body-tertiary rounded d-flex align-items-center gap-3 p-3">
        <span
          className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded bg-body-secondary"
          style={{ width: 42, height: 42, color: "var(--bs-primary)" }}
          aria-hidden="true"
        >
          <CloudDoneIcon />
        </span>
        <div className="d-flex flex-column min-w-0">
          <span className="fw-bold text-dark-emphasis text-balance">
            {t("syncConnected")}
          </span>
          <span className="small text-body-secondary text-balance">
            {syncing
              ? t("syncSyncing")
              : lastSyncedAt
                ? t(
                    "syncedAgo",
                    formatDistanceToNow(lastSyncedAt, {
                      addSuffix: true,
                      locale: getDateFnsLocale(),
                    }),
                  )
                : t("syncNeverSynced")}
          </span>
        </div>
      </div>

      <div className="bg-body-tertiary rounded d-flex flex-column gap-3 p-3">
        <div className="form-floating input-readonly">
          <input
            id="sync-account-name"
            className="form-control"
            placeholder=""
            value={user?.name ?? ""}
            disabled
            readOnly
          />
          <label htmlFor="sync-account-name">{t("syncAccountName")}</label>
        </div>
        <div className="form-floating input-readonly">
          <input
            id="sync-account-email"
            className="form-control"
            placeholder=""
            value={user?.email ?? ""}
            disabled
            readOnly
          />
          <label htmlFor="sync-account-email">{t("syncAccountEmail")}</label>
        </div>
      </div>

      {/* Labels too long to share a row (e.g. Russian) put each button on its own row */}
      <div className="d-flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-secondary flex-fill text-nowrap d-inline-flex align-items-center justify-content-center gap-2"
          onClick={() => onSync()}
          disabled={syncing}
        >
          <FontAwesomeIcon icon={faArrowsRotate} spin={syncing} />
          {t("syncNow")}
        </button>
        <button
          type="button"
          className="btn btn-secondary flex-fill text-nowrap d-inline-flex align-items-center justify-content-center gap-2"
          onClick={() => onDisconnect()}
        >
          <FontAwesomeIcon icon={faLinkSlash} />
          {t("syncDisconnect")}
        </button>
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
