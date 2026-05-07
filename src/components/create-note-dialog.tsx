import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, PenLine, Sparkles, X } from "lucide-react";
import { useNotes } from "../lib/notes-context";
import { useTheme } from "../lib/theme-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const formSchema = z.object({
  title: z.string().min(1, "A title is required."),
});

export function CreateNoteDialog() {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const navigate = useNavigate();
  const { createNote, config, selectFolder } = useNotes();
  const { dark } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  async function handleBrowse() {
    const chosen = await selectFolder();
    if (chosen) setSelectedFolder(chosen);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setCreating(true);
    try {
      const note = await createNote({
        title: values.title,
        content: "",
        folderPath: selectedFolder ?? undefined,
      });
      setOpen(false);
      form.reset();
      setSelectedFolder(null);
      navigate(`/notes/${encodeURIComponent(note.id)}`);
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) { form.reset(); setSelectedFolder(null); }
  }

  const displayFolder = selectedFolder ?? config?.notesFolder ?? "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn-gradient flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          New Note
        </button>
      </DialogTrigger>

      <DialogContent
        className={`sm:max-w-[440px] rounded-2xl border-0 p-0 overflow-hidden ${
          dark ? "dialog-glass-dark" : "dialog-glass-light"
        }`}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className={`text-xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              Start a new note
            </DialogTitle>
            <DialogDescription className={dark ? "text-slate-400" : "text-slate-500"}>
              Saved as a{" "}
              <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${dark ? "bg-sky-500/15 text-sky-400" : "bg-sky-50 text-sky-600"}`}>
                .md
              </code>{" "}
              file you can open anywhere.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-sm font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Morning reflections"
                        autoFocus
                        className={`h-11 rounded-xl border font-medium transition-all ${
                          dark
                            ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-sky-500/5 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.1)]"
                            : "bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.08)]"
                        }`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Folder picker */}
              <div className="space-y-2">
                <p className={`text-sm font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  Save location
                </p>
                <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                  dark
                    ? "bg-white/5 border-white/8"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <FolderOpen className={`h-4 w-4 shrink-0 ${dark ? "text-indigo-400" : "text-sky-500"}`} />
                  <span
                    className={`flex-1 text-xs font-mono truncate ${dark ? "text-slate-400" : "text-slate-500"}`}
                    title={displayFolder}
                  >
                    {displayFolder || "Default folder"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {selectedFolder && (
                      <button
                        type="button"
                        onClick={() => setSelectedFolder(null)}
                        className={`p-0.5 rounded transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleBrowse}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                        dark
                          ? "text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
                          : "text-sky-600 hover:text-sky-500 hover:bg-sky-50"
                      }`}
                    >
                      Browse…
                    </button>
                  </div>
                </div>
                {selectedFolder && (
                  <p className={`text-xs ${dark ? "text-indigo-400/60" : "text-sky-500/70"}`}>
                    This note will be saved to the selected folder.
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-gradient w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {creating ? "Creating…" : "Create Note"}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
