import { useLibraryStore } from "@/store/libraryStore";
import { SearchResultsList } from "@/components/search/SearchView";

export function SearchView() {
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const search = useLibraryStore((s) => s.search);

  return (
    <div className="px-8 py-10">
      <input
        autoFocus
        type="text"
        value={searchQuery}
        onChange={(e) => search(e.target.value)}
        placeholder="Titel, Alben, Künstler, Playlists…"
        className="mb-8 w-full max-w-xl rounded-full border border-aurora-border bg-aurora-surface px-5 py-3 text-sm text-aurora-text placeholder:text-aurora-muted focus:outline-none focus:ring-2 focus:ring-aurora-accent"
      />
      <SearchResultsList />
    </div>
  );
}
