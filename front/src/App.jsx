import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { SocketProvider } from "./context/SocketProvider";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProfileDetailPage } from "./pages/ProfileDetailPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { BrowsePage } from "./pages/BrowsePage";
import { SearchPage } from "./pages/SearchPage";
import { ChatPage } from "./pages/ChatPage";
import { ChatConversationPage } from "./pages/ChatConversationPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="users/:id" element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
              <Route path="search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="chat/:id" element={<ProtectedRoute><ChatConversationPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
