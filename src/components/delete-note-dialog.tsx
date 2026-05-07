import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useNotes } from "../lib/notes-context";
import { useTheme } from "../lib/theme-context";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Note } from "../types";

interface DeleteNoteDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteNoteDialog({ note, open, onOpenChange }: DeleteNoteDialogProps) {
  const { deleteNote } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();
  const { dark } = useTheme();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteNote(note.id);
      toast.success(`"${note.title}.md" deleted`);
      onOpenChange(false);
      if (location.pathname.includes(encodeURIComponent(note.id))) {
        navigate("/");
      }
    } catch {
      toast.error("Failed to delete note file");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`rounded-2xl border-0 p-0 overflow-hidden max-w-[400px] ${
          dark ? "dialog-glass-dark" : "dialog-glass-light"
        }`}
      >
        {/* Red top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />

        <div className="p-6">
          <AlertDialogHeader className="mb-5">
            <AlertDialogTitle className={`text-xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              Delete this note?
            </AlertDialogTitle>
            <AlertDialogDescription className={`space-y-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              <span className="block">
                This will permanently remove{" "}
                <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${dark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"}`}>
                  {note.title}.md
                </code>{" "}
                from your disk. This cannot be undone.
              </span>
              <span className={`block text-[11px] font-mono truncate ${dark ? "text-slate-600" : "text-slate-400"}`} title={note.filePath}>
                {note.filePath}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex gap-3 sm:flex-row">
            <AlertDialogCancel
              disabled={deleting}
              className={`flex-1 rounded-xl border font-medium ${
                dark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Cancel
            </AlertDialogCancel>
            <button
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {deleting ? "Deleting…" : "Delete file"}
            </button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
