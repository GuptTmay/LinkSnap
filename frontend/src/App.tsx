import { Toaster } from 'sonner';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/Auth";
import Home from "@/pages/Home";
import LinksCreatePage from "@/pages/LinksCreatePage";
import QrCodesCreatePage from "@/pages/QrCodesCreatePage";
import LinksListPage from "@/pages/LinksListPage";
import QrCodesListPage from "@/pages/QrCodesListPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import LinkDetailsPage from "@/pages/LinkDetailsPage";
import LinkEditPage from "@/pages/LinkEditPage";
import QrCodeDetailsPage from "@/pages/QrCodeDetailsPage";
import QrCodeEditPage from "@/pages/QrCodeEditPage";
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <Toaster position="bottom-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected App Routes with AppLayout */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/links"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LinksListPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/links/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LinksCreatePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/links/:shortUrl/details"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LinkDetailsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/links/:shortUrl/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LinkEditPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QrCodesListPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes/create"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QrCodesCreatePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes/:shortUrl/details"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QrCodeDetailsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes/:shortUrl/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QrCodeEditPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={
                <NotFound />
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;