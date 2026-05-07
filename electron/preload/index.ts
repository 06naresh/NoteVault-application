import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

interface Note {
  id: string;
  title: string;
  content: string;
  filePath: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

interface Config {
  notesFolder: string;
}

const notesAPI = {
  // Config
  getConfig: (): Promise<Config> => ipcRenderer.invoke("config:get"),
  setFolder: (folderPath: string): Promise<{ success: boolean; config?: Config; error?: string }> =>
    ipcRenderer.invoke("config:setFolder", folderPath),

  // Native folder picker
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke("dialog:selectFolder"),

  // Notes CRUD
  list: (): Promise<Note[]> => ipcRenderer.invoke("notes:list"),
  get: (id: string): Promise<Note | null> => ipcRenderer.invoke("notes:get", id),
  create: (data: {
    title: string;
    content?: string;
    folderPath?: string;
  }): Promise<Note> => ipcRenderer.invoke("notes:create", data),
  update: (
    id: string,
    data: { title?: string; content?: string }
  ): Promise<Note> => ipcRenderer.invoke("notes:update", id, data),
  delete: (id: string): Promise<boolean> => ipcRenderer.invoke("notes:delete", id),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("notesAPI", notesAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.notesAPI = notesAPI;
}
