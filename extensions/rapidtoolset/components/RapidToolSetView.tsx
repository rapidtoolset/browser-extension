import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faCloud,
  faGlobe,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import EmptyState from "@/components/EmptyState";
import ErrorAlert from "@/components/ErrorAlert";
import Spinner from "@/components/Spinner";
import { TabPanel, Tabs } from "@/components/Tabs";
import { useScrollable } from "@/lib/useScrollable";
import ToolCard from "./ToolCard";
import ToolView from "./ToolView";
import SyncView from "./SyncView";
import { useRapidToolSet } from "../lib/useRapidToolSet";
import { t } from "../lib/i18n";
import type { OpenToolsIn, SearchTab } from "../lib/types";

const TABS_ID = "rapidtoolset-tabs";

interface Props {
  /** Where a click on a tool opens it */
  openToolsIn: OpenToolsIn;
}

export default function RapidToolSetView({ openToolsIn }: Props) {
  const {
    bookmarks,
    searchResults,
    query,
    tab,
    isSearching,
    isSearchMode,
    hasSearched,
    searchError,
    loadingBookmarks,
    setQuery,
    setTab,
    restored,
    openTool,
    setOpenTool,
    popupWarningHidden,
    hidePopupWarning,
    isBookmarked,
    toggleBookmark,
    connected,
    connecting,
    syncing,
    syncError,
    lastSyncedAt,
    remoteUser,
    connect,
    disconnect,
    sync,
  } = useRapidToolSet();
  const { ref: onlineRef, needsPadding: onlinePadding } =
    useScrollable<HTMLDivElement>();
  const { ref: bookmarksRef, needsPadding: bookmarksPadding } =
    useScrollable<HTMLDivElement>();

  const showSpinner =
    tab === "online"
      ? isSearching
      : tab === "bookmarks"
        ? loadingBookmarks
        : false;

  // Unless the settings say the popup, the tool cards' links open the website in a new tab
  const openInPopup = openToolsIn === "popup" ? setOpenTool : undefined;

  if (!restored) return null;

  if (openTool) {
    return (
      <ToolView
        tool={openTool}
        bookmarked={isBookmarked(openTool.url)}
        onToggleBookmark={toggleBookmark}
        onBack={() => setOpenTool(null)}
        warn={!popupWarningHidden}
        onHideWarning={hidePopupWarning}
      />
    );
  }

  return (
    <div className="d-flex flex-column flex-grow-1 min-h-0 gap-3 p-3">
      <Tabs
        id={TABS_ID}
        activeTab={tab}
        onTabChange={(key) => setTab(key as SearchTab)}
        items={[
          {
            key: "online",
            label: t("tabOnline"),
            icon: <FontAwesomeIcon icon={faGlobe} widthAuto />,
          },
          {
            key: "bookmarks",
            label: t("tabBookmarks"),
            icon: <FontAwesomeIcon icon={faBookmark} widthAuto />,
          },
          {
            key: "sync",
            label: t("tabSync"),
            icon: <FontAwesomeIcon icon={faCloud} widthAuto />,
          },
        ]}
      />

      {tab !== "sync" && (
        <div className="search-bar rounded p-2 d-flex align-items-center border flex-shrink-0">
          <div className="ps-2 pe-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-muted" />
          </div>
          <input
            autoFocus
            type="text"
            spellCheck={false}
            className="form-control border-0 bg-transparent shadow-none"
            placeholder={
              tab === "online"
                ? t("searchPlaceholderOnline")
                : t("searchPlaceholderBookmarks")
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("searchAriaLabel")}
          />
          {showSpinner ? (
            <div className="pe-2 ps-1 flex-shrink-0 d-flex">
              <Spinner size="sm" color="muted" />
            </div>
          ) : (
            query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("clearSearch")}
                className="btn btn-link text-muted pe-2 ps-1 py-0 border-0 flex-shrink-0"
                style={{ lineHeight: 1 }}
              >
                <FontAwesomeIcon icon={faXmark} size="lg" />
              </button>
            )
          )}
        </div>
      )}

      {searchError && (
        <ErrorAlert className="flex-shrink-0">{searchError}</ErrorAlert>
      )}

      <TabPanel
        tabsId={TABS_ID}
        value="online"
        activeValue={tab}
        ref={onlineRef}
        className={classNames(
          "scroll-area d-flex flex-column flex-grow-1 min-h-0 gap-2",
          { "scrollbar-gutter": onlinePadding },
        )}
      >
        {!isSearchMode && !isSearching && (
          <EmptyState
            icon={<TravelExploreIcon />}
            title={t("emptyOnlinePrompt")}
          />
        )}

        {isSearchMode &&
          !isSearching &&
          !searchError &&
          hasSearched &&
          searchResults.length === 0 && (
            <EmptyState
              icon={<SearchOffIcon />}
              title={t("emptyNoToolsFound")}
            />
          )}

        {searchResults.map((tool) => (
          <ToolCard
            key={tool.url}
            tool={tool}
            bookmarked={isBookmarked(tool.url)}
            onToggleBookmark={toggleBookmark}
            onOpen={openInPopup}
          />
        ))}
      </TabPanel>

      <TabPanel
        tabsId={TABS_ID}
        value="bookmarks"
        activeValue={tab}
        ref={bookmarksRef}
        className={classNames(
          "scroll-area d-flex flex-column flex-grow-1 min-h-0 gap-2",
          { "scrollbar-gutter": bookmarksPadding },
        )}
      >
        {loadingBookmarks && (
          <div className="d-flex align-items-center justify-content-center gap-2 py-4 text-body-secondary">
            <Spinner size="sm" />
            {t("statusLoading")}
          </div>
        )}

        {!loadingBookmarks && bookmarks.length === 0 && (
          <EmptyState
            icon={<BookmarkAddOutlinedIcon />}
            title={
              query.trim()
                ? t("emptyBookmarksNoMatch")
                : t("emptyBookmarksNone")
            }
            description={!query.trim() ? t("emptyBookmarksCta") : undefined}
          />
        )}

        {!loadingBookmarks &&
          bookmarks.map((tool) => (
            <ToolCard
              key={tool.url}
              tool={tool}
              bookmarked={isBookmarked(tool.url)}
              onToggleBookmark={toggleBookmark}
              onOpen={openInPopup}
            />
          ))}
      </TabPanel>

      <TabPanel
        tabsId={TABS_ID}
        value="sync"
        activeValue={tab}
        className="d-flex flex-column flex-grow-1 min-h-0"
      >
        <SyncView
          connected={connected}
          connecting={connecting}
          syncing={syncing}
          error={syncError}
          lastSyncedAt={lastSyncedAt}
          user={remoteUser}
          onConnect={connect}
          onDisconnect={disconnect}
          onSync={sync}
        />
      </TabPanel>
    </div>
  );
}
