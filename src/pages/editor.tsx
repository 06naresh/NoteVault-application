import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FolderOpen, Loader2, Moon, Save, Sun } from "lucide-react";
import { useNotes } from "../lib/notes-context";
import { useTheme } from "../lib/theme-context";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateNote } = useNotes();
  const { dark, toggle } = useTheme();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filePath, setFilePath] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notFound, setNotFound] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const currentIdRef = useRef<string>("");
  const lastSaved = useRef({ title: "", content: "" });
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const noteId = id ? decodeURIComponent(id) : "";

  useEffect(() => {
    if (!noteId) { setNotFound(true); return; }
    async function load() {
      const note = await window.notesAPI.get(noteId);
      if (!note) { setNotFound(true); return; }
      setTitle(note.title);
      setContent(note.content ?? "");
      setFilePath(note.filePath);
      currentIdRef.current = note.id;
      lastSaved.current = { title: note.title, content: note.content ?? "" };
      setInitialized(true);
    }
    load();
  }, [noteId]);

  useEffect(() => {
    if (!initialized) return;
    const hasChanged = title !== lastSaved.current.title || content !== lastSaved.current.content;
    if (!hasChanged) return;
    setSaveStatus("saving");
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const updated = await updateNote(currentIdRef.current, { title, content });
        currentIdRef.current = updated.id;
        setFilePath(updated.filePath);
        lastSaved.current = { title, content };
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 800);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [title, content, initialized, updateNote]);

  if (notFound) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${dark ? "bg-mesh-dark" : "bg-mesh-light"}`}>
        <h2 className={`text-3xl font-bold mb-4 ${dark ? "text-white" : "text-slate-800"}`}>Note not found</h2>
        <p className={`mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
          This note's file may have been moved or deleted.
        </p>
        <button
          onClick={() => navigate("/")}
          className="btn-gradient px-6 py-2.5 rounded-full text-white text-sm font-semibold"
        >
          Return home
        </button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-mesh-dark" : "bg-mesh-light"}`}>
        <Loader2 className={`h-6 w-6 animate-spin ${dark ? "text-sky-400" : "text-sky-500"}`} />
      </div>
    );
  }

  return (
    <main className={`min-h-screen flex flex-col ${dark ? "bg-mesh-dark" : "bg-mesh-light"}`}>

      {/* Header */}
      <header className={`sticky top-0 z-10 ${dark ? "header-glass-dark" : "header-glass-light"}`}>
        <div className="max-w-[800px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-1.5 text-sm font-medium -ml-2 px-2 py-1.5 rounded-lg transition-all ${
              dark
                ? "text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
                : "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            NoteVault
          </button>

          <div className="flex items-center gap-3">
            {/* Save status */}
            <div className={`flex items-center text-xs font-medium min-w-[72px] justify-end`}>
              {saveStatus === "saving" && (
                <span className={`flex items-center gap-1.5 ${dark ? "text-sky-400" : "text-sky-500"}`}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving
                </span>
              )}
              {saveStatus === "saved" && (
                <span className={`flex items-center gap-1.5 animate-in fade-in ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
                  <Save className="h-3 w-3" />
                  Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-red-400">
                  Save failed
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                dark
                  ? "text-yellow-400 hover:bg-yellow-400/10"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* File path bar */}
        {filePath && (
          <div className={`border-t ${dark ? "border-indigo-500/8 bg-white/[0.02]" : "border-sky-100/80 bg-sky-50/40"}`}>
            <div className="max-w-[800px] mx-auto px-6 h-8 flex items-center gap-2">
              <FolderOpen className={`h-3 w-3 shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`} />
              <span
                className={`text-xs font-mono truncate ${dark ? "text-slate-600" : "text-slate-400"}`}
                title={filePath}
              >
                {filePath}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Editor */}
      <div className="flex-1 w-full max-w-[800px] mx-auto px-8 pt-14 pb-24 flex flex-col">

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className={`w-full bg-transparent text-4xl md:text-5xl font-bold leading-tight tracking-tight placeholder:opacity-20 border-none outline-none mb-2 ${
            dark ? "text-white placeholder:text-white" : "text-slate-900 placeholder:text-slate-900"
          }`}
          style={{ WebkitUserSelect: "text" }}
        />

        {/* Divider */}
        <div className={`h-px mb-10 ${dark ? "bg-gradient-to-r from-sky-500/30 via-indigo-500/20 to-transparent" : "bg-gradient-to-r from-sky-300/50 via-indigo-200/40 to-transparent"}`} />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          className={`flex-1 w-full bg-transparent text-base md:text-lg leading-[1.85] placeholder:opacity-20 border-none outline-none resize-none min-h-[400px] ${
            dark ? "text-slate-200 placeholder:text-slate-200" : "text-slate-700 placeholder:text-slate-700"
          }`}
          style={{ WebkitUserSelect: "text" }}
        />
      </div>
    </main>
  );
}
