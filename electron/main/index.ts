import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join, basename, extname } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  renameSync,
  statSync,
} from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Config ──────────────────────────────────────────────────────────────────

function getConfigPath(): string {
  return join(app.getPath("userData"), "config.json");
}

function getDefaultNotesFolder(): string {
  return join(app.getPath("userData"), "Notes");
}

function loadConfig(): Config {
  const path = getConfigPath();
  if (!existsSync(path)) {
    const defaultConfig: Config = { notesFolder: getDefaultNotesFolder() };
    writeFileSync(path, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as Config;
  } catch {
    return { notesFolder: getDefaultNotesFolder() };
  }
}

function saveConfig(config: Config): void {
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
}

function ensureFolder(folderPath: string): void {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }
}

// ─── Filename helpers ─────────────────────────────────────────────────────────

function sanitizeFilename(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "untitled"
  );
}

function uniqueFilePath(folder: string, baseName: string): string {
  let candidate = join(folder, `${baseName}.md`);
  if (!existsSync(candidate)) return candidate;
  let i = 2;
  while (existsSync(join(folder, `${baseName} (${i}).md`))) i++;
  return join(folder, `${baseName} (${i}).md`);
}

// ─── Note I/O ─────────────────────────────────────────────────────────────────

function readNoteFromFile(filePath: string): Note | null {
  try {
    const stats = statSync(filePath);
    const fileName = basename(filePath, extname(filePath));
    const content = readFileSync(filePath, "utf-8");
    return {
      id: filePath,
      title: fileName,
      content,
      filePath,
      folderPath: filePath.replace(/[\\/][^\\/]+$/, ""),
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function listNotes(folderPath: string): Note[] {
  try {
    ensureFolder(folderPath);
    const files = readdirSync(folderPath).filter((f) => f.endsWith(".md"));
    const notes: Note[] = [];
    for (const file of files) {
      const note = readNoteFromFile(join(folderPath, file));
      if (note) notes.push(note);
    }
    return notes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

// ─── Window ───────────────────────────────────────────────────────────────────

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: "NoteVault",
    titleBarStyle: "hiddenInset",
    backgroundColor: "#020617",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// ─── App + IPC ────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.notevault.app");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Config
  ipcMain.handle("config:get", () => {
    return loadConfig();
  });

  ipcMain.handle("config:setFolder", (_, folderPath: string) => {
    try {
      ensureFolder(folderPath);
      const config: Config = { notesFolder: folderPath };
      saveConfig(config);
      return { success: true, config };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Native folder picker
  ipcMain.handle("dialog:selectFolder", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win!, {
      properties: ["openDirectory", "createDirectory"],
      title: "Select Notes Folder",
      buttonLabel: "Use this folder",
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // List all notes
  ipcMain.handle("notes:list", () => {
    const config = loadConfig();
    return listNotes(config.notesFolder);
  });

  // Get single note
  ipcMain.handle("notes:get", (_, id: string) => {
    try {
      return readNoteFromFile(id);
    } catch {
      return null;
    }
  });

  // Create note
  ipcMain.handle(
    "notes:create",
    (_, data: { title: string; content?: string; folderPath?: string }) => {
      const config = loadConfig();
      const targetFolder = data.folderPath || config.notesFolder;
      try {
        ensureFolder(targetFolder);
        const baseName = sanitizeFilename(data.title);
        const filePath = uniqueFilePath(targetFolder, baseName);
        const content = data.content ?? "";
        writeFileSync(filePath, content, "utf-8");
        return readNoteFromFile(filePath);
      } catch (err) {
        throw new Error(`Failed to create note: ${err}`);
      }
    }
  );

  // Update note (content and/or title)
  ipcMain.handle(
    "notes:update",
    (_, id: string, data: { title?: string; content?: string }) => {
      try {
        if (!existsSync(id)) throw new Error("Note file not found");

        let currentPath = id;

        // Rename file if title changed
        if (data.title !== undefined) {
          const dir = currentPath.replace(/[\\/][^\\/]+$/, "");
          const newBaseName = sanitizeFilename(data.title);
          const newPath = join(dir, `${newBaseName}.md`);
          if (newPath !== currentPath) {
            if (existsSync(newPath)) {
              const unique = uniqueFilePath(dir, newBaseName);
              renameSync(currentPath, unique);
              currentPath = unique;
            } else {
              renameSync(currentPath, newPath);
              currentPath = newPath;
            }
          }
        }

        // Write content
        if (data.content !== undefined) {
          writeFileSync(currentPath, data.content, "utf-8");
        }

        return readNoteFromFile(currentPath);
      } catch (err) {
        throw new Error(`Failed to update note: ${err}`);
      }
    }
  );

  // Delete note
  ipcMain.handle("notes:delete", (_, id: string) => {
    try {
      if (!existsSync(id)) throw new Error("Note file not found");
      unlinkSync(id);
      return true;
    } catch (err) {
      throw new Error(`Failed to delete note: ${err}`);
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
