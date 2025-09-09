interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Renders a centered header for authentication pages with a required title and optional subtitle.
 *
 * The title is displayed as a bold h1; the subtitle, if provided, appears beneath the title.
 *
 * @param title - Main heading text shown prominently.
 * @param subtitle - Optional secondary text shown under the title when present.
 */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header className="py-4 px-6 border-b bg-white">
      <div className="container mx-auto flex justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}
