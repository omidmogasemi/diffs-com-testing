import { Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import DiffViewer from "./pages/DiffViewer";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

/**
 * The app's route tree. Kept separate from `main.tsx` so it can be mounted
 * under any router (HashRouter in the app, MemoryRouter in tests).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Home />} />
        <Route path="diff" element={<DiffViewer />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
