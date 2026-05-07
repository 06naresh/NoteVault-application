import { BookOpen, FolderOpen, Moon, RefreshCw, Sun } from "lucide-react";
import { useNotes } from "../lib/notes-context";
import { useTheme } from "../lib/theme-context";
import { CreateNoteDialog } from "../components/create-note-dialog";
import { NoteCard } from "../components/note-card";
import { toast } from "sonner";

export default function Home() {
  const { notes, config, loading, changeFolder, selectFolder, refresh } = useNotes();
  const { dark, toggle } = useTheme();

  async function handleChangeFolder() {
    const chosen = await selectFolder();
    if (!chosen) return;
    const result = await changeFolder(chosen);
    if (result.success) {
      toast.success("Notes folder updated");
    } else {
      toast.error(result.error ?? "Failed to change folder");
    }
  }

  return (
    <main className={`min-h-screen pb-24 ${dark ? "bg-mesh-dark" : "bg-mesh-light"}`}>

      {/* Header */}
      <header className={`sticky top-0 z-20 ${dark ? "header-glass-dark" : "header-glass-light"}`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              dark
                ? "bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20"
                : "bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200/60"
            }`}>
              <BookOpen className={`h-4.5 w-4.5 ${dark ? "text-sky-400" : "text-sky-600"}`} />
            </div>
            <div>
              <span className={`font-semibold text-lg tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
                NoteVault
              </span>
              {!loading && (
                <p className={`text-xs leading-none mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={refresh}
              title="Refresh"
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                dark
                  ? "text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
                  : "text-slate-400 hover:text-sky-600 hover:bg-sky-50"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                dark
                  ? "text-yellow-400 hover:bg-yellow-400/10"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <CreateNoteDialog />
          </div>
        </div>

        {/* Folder bar */}
        <div className={`border-t ${dark ? "border-indigo-500/8 bg-white/[0.02]" : "border-sky-100/80 bg-sky-50/40"}`}>
          <div className="max-w-5xl mx-auto px-6 h-9 flex items-center gap-2">
            <FolderOpen className={`h-3 w-3 shrink-0 ${dark ? "text-slate-500" : "text-slate-400"}`} />
            <span className={`text-xs truncate flex-1 font-mono ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {config?.notesFolder ?? "Loading…"}
            </span>
            <button
              onClick={handleChangeFolder}
              className={`text-xs font-semibold shrink-0 transition-colors ${
                dark ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-500"
              }`}
            >
              Change folder
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-6 pt-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className={`h-10 w-10 rounded-full border-2 border-t-sky-400 border-indigo-500/20 animate-spin mb-5`} />
            <p className={`text-sm font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Loading your notes…
            </p>
          </div>
        ) : notes.length > 0 ? (
          <>
            <h2 className={`text-xs font-semibold uppercase tracking-widest mb-6 ${dark ? "text-slate-500" : "text-slate-400"}`}>
              All Notes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, i) => (
                <div
                  key={note.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-36 text-center max-w-sm mx-auto">
            {/* Glow orb */}
            <div className="relative mb-8">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${dark ? "bg-sky-400" : "bg-sky-300"}`} />
              <div className={`relative h-20 w-20 rounded-2xl flex items-center justify-center ${
                dark
                  ? "bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/15"
                  : "bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/60"
              }`}>
                <BookOpen className={`h-8 w-8 ${dark ? "text-sky-400" : "text-sky-500"}`} />
              </div>
            </div>

            <h2 className={`text-2xl font-bold mb-3 ${dark ? "text-white" : "text-slate-800"}`}>
              Your notes live here
            </h2>
            <p className={`text-sm leading-relaxed mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Create your first note — it'll be saved as a{" "}
              <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${dark ? "bg-slate-800 text-sky-400" : "bg-sky-50 text-sky-600"}`}>.md</code>{" "}
              file you can open anywhere.
            </p>
            <CreateNoteDialog />
          </div>
        )}
      </div>
    </main>
  );
}
