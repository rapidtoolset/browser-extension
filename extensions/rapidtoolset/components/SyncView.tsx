import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "../lib/i18n";
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
      <EmptyState
        icon={<Cloud />}
        title={t("syncEmptyTitle")}
        className="flex-1"
      >
        <Button
          type="button"
          size="sm"
          className="mt-2 gap-1.5"
          onClick={() => onConnect()}
          disabled={connecting}
        >
          <Cloud size={14} />
          {connecting ? t("syncConnecting") : t("syncConnectCta")}
        </Button>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <TriangleAlert size={12} className="shrink-0" />
            {error}
          </p>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-3 text-sm">
        <CloudCheck size={18} className="shrink-0 text-emerald-500" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-card-foreground">
            {t("syncConnected")}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {syncing
              ? t("syncSyncing")
              : lastSyncedAt
                ? t(
                    "syncedAgo",
                    formatDistanceToNow(lastSyncedAt, { addSuffix: true }),
                  )
                : t("syncNeverSynced")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sync-account-name">{t("syncAccountName")}</Label>
          <Input
            id="sync-account-name"
            value={user?.name ?? ""}
            disabled
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sync-account-email">{t("syncAccountEmail")}</Label>
          <Input
            id="sync-account-email"
            value={user?.email ?? ""}
            disabled
            readOnly
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => onSync()}
          disabled={syncing}
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {t("syncNow")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-1.5"
          onClick={() => onDisconnect()}
        >
          <CloudOff size={14} />
          {t("syncDisconnect")}
        </Button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <TriangleAlert size={12} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
