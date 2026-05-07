import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FileText, FolderOpen, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DeleteNoteDialog } from "./delete-note-dialog";
import { Note } from "../types";
import { useTheme } from "../lib/theme-context";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const folderShort = note.folderPath
    ? note.folderPath.replace(/\\/g, "/").split("/").slice(-2).join("/")
    : null;

  return (
    <>
      <div
        onClick={() => navigate(`/notes/${encodeURIComponent(note.id)}`)}
        className={`cursor-pointer group h-full flex flex-col p-5 rounded-2xl ${dark ? "note-card-dark" : "note-card-light"}`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className={`font-semibold text-base leading-snug line-clamp-2 flex-1 min-w-0 ${dark ? "text-white" : "text-slate-800"}`}>
            {note.title}
          </h3>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-1 -mt-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                    dark
                      ? "text-slate-500 hover:text-white hover:bg-white/8"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-[148px] ${
                  dark
                    ? "bg-[#0c1425] border-indigo-500/15 shadow-2xl"
                    : "bg-white border-slate-200 shadow-lg"
                }`}
              >
                <DropdownMenuItem
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content preview */}
        {note.content && (
          <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {note.content}
          </p>
        )}

        {/* Footer */}
        <div className={`mt-auto pt-3 flex items-center justify-between text-xs border-t ${dark ? "border-white/5" : "border-slate-100"}`}>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <FileText className={`h-3 w-3 shrink-0 ${dark ? "text-sky-500/50" : "text-sky-400/70"}`} />
            <span className={`truncate font-mono text-[11px] ${dark ? "text-slate-600" : "text-slate-400"}`}>
              {note.title}.md
            </span>
          </div>
          <span className={`shrink-0 ml-2 whitespace-nowrap ${dark ? "text-slate-600" : "text-slate-400"}`}>
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {/* Folder on hover */}
        {folderShort && (
          <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${dark ? "text-indigo-400/50" : "text-sky-400/60"}`}>
            <FolderOpen className="h-3 w-3 shrink-0" />
            <span className="truncate" title={note.folderPath}>{folderShort}</span>
          </div>
        )}
      </div>

      <DeleteNoteDialog note={note} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
