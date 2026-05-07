import { useNavigate } from "react-router-dom";
import { useTheme } from "../lib/theme-context";

export default function NotFound() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${dark ? "bg-mesh-dark" : "bg-mesh-light"}`}>
      <p className="text-8xl font-bold mb-4 gradient-text">404</p>
      <h2 className={`text-2xl font-bold mb-3 ${dark ? "text-white" : "text-slate-800"}`}>
        Page not found
      </h2>
      <p className={`mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>
        This page doesn't exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="btn-gradient px-6 py-2.5 rounded-full text-white text-sm font-semibold"
      >
        Go home
      </button>
    </div>
  );
}
