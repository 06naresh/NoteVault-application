export interface Note {
  id: string;
  title: string;
  content: string;
  filePath: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  notesFolder: string;
}

export interface NotesAPI {
  getConfig: () => Promise<Config>;
  setFolder: (folderPath: string) => Promise<{ success: boolean; config?: Config; error?: string }>;
  selectFolder: () => Promise<string | null>;
  list: () => Promise<Note[]>;
  get: (id: string) => Promise<Note | null>;
  create: (data: { title: string; content?: string; folderPath?: string }) => Promise<Note>;
  update: (id: string, data: { title?: string; content?: string }) => Promise<Note>;
  delete: (id: string) => Promise<boolean>;
}

declare global {
  interface Window {
    notesAPI: NotesAPI;
  }
}
