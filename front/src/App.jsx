import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { AuthProvider } from "./context/AuthContext";
import { GlobalLoadingProvider } from "./components/GlobalLoading";
import { useGlobalLoading } from "./components/GlobalLoading";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import Header from "./components/Header/index.jsx";
import Footer from "./components/Footer/index.jsx";
import HomePage from "./pages/HomePage/index.jsx";
import LogInPage from "./pages/LoginPage/index.jsx";
import RegisterStep1Page from "./pages/RegisterStep1Page/index.jsx";
import RegisterStep2Page from "./pages/RegisterStep2Page/index.jsx";
import ProfilePage from "./pages/ProfilePage/index.jsx";
import UsersPage from "./pages/UsersPage/index.jsx";
import TeamsPage from "./pages/TeamsPage/index.jsx";
import AboutPage from "./pages/AboutPage/index.jsx";
import CreateTeamPage from "./pages/CreateTeamPage/index.jsx";
import MyTeamsPage from "./pages/MyTeamsPage/index.jsx";
import NotificationsPage from "./pages/NotificationsPage/index.jsx";
import MyRequestsPage from "./pages/MyRequestsPage/index.jsx";
import TeamPublicPage from "./pages/TeamPublicPage/index.jsx";
import TeamPrivatePage from "./pages/TeamPrivatePage/index.jsx";
import UserDetailPage from "./pages/UserDetailPage/index.jsx";
import ForgotCredentialsPage from "./pages/ForgotCredentialsPage/index.jsx";

function AppContent() {
    const { isLoading } = useGlobalLoading();
    const location = useLocation();
    
    // Создаем уникальный ключ для каждого маршрута, чтобы принудительно размонтировать компоненты
    const routeKey = useMemo(() => {
        return location.pathname;
    }, [location.pathname]);
    
    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                {isLoading && <div style={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}></div>}
                <Routes key={routeKey}>
                    <Route path="/" element={<HomePage key={routeKey} />} />
                    <Route path="/teams" element={<TeamsPage key={routeKey} />} />
                    <Route
                        path="/my-teams"
                        element={
                            <ProtectedRoute>
                                <MyTeamsPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams/create"
                        element={
                            <ProtectedRoute>
                                <CreateTeamPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/about" element={<AboutPage key={routeKey} />}/>

                    {/* Только для НЕавторизованных */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LogInPage key={routeKey} />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/forgot"
                        element={
                            <GuestRoute>
                                <ForgotCredentialsPage key={routeKey} />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register-step1"
                        element={
                            <GuestRoute>
                                <RegisterStep1Page key={routeKey} />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register-step2"
                        element={
                            <GuestRoute>
                                <RegisterStep2Page key={routeKey} />
                            </GuestRoute>
                        }
                    />

                    {/* Только для авторизованных */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users"
                        element={<UsersPage key={routeKey} />}
                    />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationsPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-requests"
                        element={
                            <ProtectedRoute>
                                <MyRequestsPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teams/:teamId"
                        element={
                            <ProtectedRoute>
                                <TeamPublicPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teams/:teamId/private"
                        element={
                            <ProtectedRoute>
                                <TeamPrivatePage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users/:username"
                        element={
                            <ProtectedRoute>
                                <UserDetailPage key={routeKey} />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <GlobalLoadingProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </GlobalLoadingProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
