import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Fragment, useEffect } from "react";
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

// Обертка для принудительного размонтирования компонентов при изменении маршрута
function RouteKeyWrapper({ children }) {
    const location = useLocation();
    
    useEffect(() => {
        // Логируем для диагностики
        console.log('RouteKeyWrapper mounted for:', location.pathname);
        return () => {
            console.log('RouteKeyWrapper unmounting for:', location.pathname);
        };
    }, [location.pathname]);
    
    // Используем div с display: contents, чтобы key работал, но не создавал лишний элемент
    return <div key={location.pathname} style={{ display: 'contents' }}>{children}</div>;
}

function AppContent() {
    const { isLoading } = useGlobalLoading();
    const location = useLocation();
    
    return (
        <div className="app-container">
            <Header />
            <main className="main-content" key={location.pathname}>
                {isLoading && <div style={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}></div>}
                <Routes>
                    <Route path="/" element={<RouteKeyWrapper><HomePage /></RouteKeyWrapper>} />
                    <Route path="/teams" element={<RouteKeyWrapper><TeamsPage/></RouteKeyWrapper>} />
                    <Route
                        path="/my-teams"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <MyTeamsPage />
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />
                    <Route
                        path="/teams/create"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <CreateTeamPage />
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />
                    <Route path="/about" element={<RouteKeyWrapper><AboutPage/></RouteKeyWrapper>}/>

                    {/* Только для НЕавторизованных */}
                    <Route
                        path="/login"
                        element={
                            <RouteKeyWrapper>
                                <GuestRoute>
                                    <LogInPage />
                                </GuestRoute>
                            </RouteKeyWrapper>
                        }
                    />
                    <Route
                        path="/forgot"
                        element={
                            <RouteKeyWrapper>
                                <GuestRoute>
                                    <ForgotCredentialsPage />
                                </GuestRoute>
                            </RouteKeyWrapper>
                        }
                    />
                    <Route
                        path="/register-step1"
                        element={
                            <RouteKeyWrapper>
                                <GuestRoute>
                                    <RegisterStep1Page />
                                </GuestRoute>
                            </RouteKeyWrapper>
                        }
                    />
                    <Route
                        path="/register-step2"
                        element={
                            <RouteKeyWrapper>
                                <GuestRoute>
                                    <RegisterStep2Page />
                                </GuestRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    {/* Только для авторизованных */}
                    <Route
                        path="/profile"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    <Route
                        path="/users"
                        element={<RouteKeyWrapper><UsersPage/></RouteKeyWrapper>}
                    />

                    <Route
                        path="/notifications"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <NotificationsPage/>
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    <Route
                        path="/my-requests"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <MyRequestsPage/>
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    <Route
                        path="/teams/:teamId"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <TeamPublicPage/>
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    <Route
                        path="/teams/:teamId/private"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <TeamPrivatePage/>
                                </ProtectedRoute>
                            </RouteKeyWrapper>
                        }
                    />

                    <Route
                        path="/users/:username"
                        element={
                            <RouteKeyWrapper>
                                <ProtectedRoute>
                                    <UserDetailPage/>
                                </ProtectedRoute>
                            </RouteKeyWrapper>
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
