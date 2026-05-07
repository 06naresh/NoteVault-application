import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Note, Config } from "../types";

interface NotesContextValue {
  notes: Note[];
  config: Config | null;
  loading: boolean;
  refresh: () => Promise<void>;
  changeFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  selectFolder: () => Promise<string | null>;
  createNote: (data: { title: string; content?: string; folderPath?: string }) => Promise<Note>;
  updateNote: (id: string, data: { title?: string; content?: string }) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cfg] = await Promise.all([
        window.notesAPI.list(),
        window.notesAPI.getConfig(),
      ]);
      setNotes(list);
      setConfig(cfg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changeFolder = useCallback(async (folderPath: string) => {
    const result = await window.notesAPI.setFolder(folderPath);
    if (result.success && result.config) {
      setConfig(result.config);
      // Reload notes from new folder
      const list = await window.notesAPI.list();
      setNotes(list);
    }
    return result;
  }, []);

  const selectFolder = useCallback(async () => {
    return window.notesAPI.selectFolder();
  }, []);

  const createNote = useCallback(
    async (data: { title: string; content?: string; folderPath?: string }) => {
      const note = await window.notesAPI.create(data);
      setNotes((prev) =>
        [note, ...prev].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      return note;
    },
    []
  );

  const updateNote = useCallback(
    async (id: string, data: { title?: string; content?: string }) => {
      const updated = await window.notesAPI.update(id, data);
      setNotes((prev) =>
        prev
          .map((n) => (n.id === id ? updated : n))
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      );
      return updated;
    },
    []
  );

  const deleteNote = useCallback(async (id: string) => {
    await window.notesAPI.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const getNote = useCallback(
    (id: string) => notes.find((n) => n.id === id),
    [notes]
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        config,
        loading,
        refresh,
        changeFolder,
        selectFolder,
        createNote,
        updateNote,
        deleteNote,
        getNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
