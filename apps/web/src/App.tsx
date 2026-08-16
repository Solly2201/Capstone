import { Route, Routes } from "react-router-dom";
import { ArticlePage } from "./pages/ArticlePage";
import { DocumentBrowserPage } from "./pages/DocumentBrowserPage";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/learn/browse" element={<DocumentBrowserPage />} />
      <Route path="/learn/:slug" element={<ArticlePage />} />
      <Route path="/report" element={<PlaceholderPage title="Report a civic issue" />} />
      <Route path="/petitions" element={<PlaceholderPage title="Community petitions" />} />
      <Route path="*" element={<PlaceholderPage title="Page not found" />} />
    </Routes>
  );
}
