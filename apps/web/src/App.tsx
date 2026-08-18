import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccountPage } from "./pages/AccountPage";
import { ArticlePage } from "./pages/ArticlePage";
import { DocumentBrowserPage } from "./pages/DocumentBrowserPage";
import { HomePage } from "./pages/HomePage";
import { LearnPage } from "./pages/LearnPage";
import { LegalAssistantPage } from "./pages/LegalAssistantPage";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/browse" element={<DocumentBrowserPage />} />
        <Route path="/learn/:slug" element={<ArticlePage />} />
        {/* Public by standing decision: basic legal information must not require an account. */}
        <Route path="/legal-assistant" element={<LegalAssistantPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="/report" element={<PlaceholderPage title="Report a civic issue" />} />
        <Route path="/petitions" element={<PlaceholderPage title="Community petitions" />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Routes>
    </AuthProvider>
  );
}
