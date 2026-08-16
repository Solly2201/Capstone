import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/learn" element={<PlaceholderPage title="Learn your rights" />} />
      <Route path="/report" element={<PlaceholderPage title="Report a civic issue" />} />
      <Route path="/petitions" element={<PlaceholderPage title="Community petitions" />} />
      <Route path="*" element={<PlaceholderPage title="Page not found" />} />
    </Routes>
  );
}
