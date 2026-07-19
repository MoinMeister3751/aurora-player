/** The app mark used as a placeholder wherever cover art is missing or
 *  fails to load (e.g. playlists without a custom or auto-generated
 *  cover). Mirrors the geometric peak shape used for the app icon. */
export function AuroraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l7 15h-4.2l-2.8-6-1.6 3.4-1.6-3.4-2.8 6H3z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
