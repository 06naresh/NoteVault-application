import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { NotesProvider } from "./lib/notes-context";
import { ThemeProvider, useTheme } from "./lib/theme-context";
import Home from "./pages/home";
import Editor from "./pages/editor";
import NotFound from "./pages/not-found";

function ThemedToaster() {
  const { dark } = useTheme();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: dark
            ? "!bg-[#0f172a] !text-slate-100 !border !border-indigo-500/20 !shadow-2xl rounded-xl font-sans text-sm backdrop-blur-xl"
            : "!bg-white !text-slate-800 !border !border-sky-200/60 !shadow-lg rounded-xl font-sans text-sm",
          description: "!text-slate-400",
          success: "!border-sky-500/30",
          error: "!border-red-500/30",
        },
      }}
    />
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes/:id" element={<Editor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
        <ThemedToaster />
      </NotesProvider>
    </ThemeProvider>
  );
}

export default App;
