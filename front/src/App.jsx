import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
function RouteWrapper({ children }) {
    const location = useLocation();
    return <div key={location.pathname}>{children}</div>;
}

function AppContent() {
    const { isLoading } = useGlobalLoading();
    const location = useLocation();
    
    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                {isLoading && <div style={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}></div>}
                <Routes>
                    <Route path="/" element={<RouteWrapper><HomePage /></RouteWrapper>} />
                    <Route path="/teams" element={<RouteWrapper><TeamsPage/></RouteWrapper>} />
                    <Route
                        path="/my-teams"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <MyTeamsPage />
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />
                    <Route
                        path="/teams/create"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <CreateTeamPage />
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />
                    <Route path="/about" element={<RouteWrapper><AboutPage/></RouteWrapper>}/>

                    {/* Только для НЕавторизованных */}
                    <Route
                        path="/login"
                        element={
                            <RouteWrapper>
                                <GuestRoute>
                                    <LogInPage />
                                </GuestRoute>
                            </RouteWrapper>
                        }
                    />
                    <Route
                        path="/forgot"
                        element={
                            <RouteWrapper>
                                <GuestRoute>
                                    <ForgotCredentialsPage />
                                </GuestRoute>
                            </RouteWrapper>
                        }
                    />
                    <Route
                        path="/register-step1"
                        element={
                            <RouteWrapper>
                                <GuestRoute>
                                    <RegisterStep1Page />
                                </GuestRoute>
                            </RouteWrapper>
                        }
                    />
                    <Route
                        path="/register-step2"
                        element={
                            <RouteWrapper>
                                <GuestRoute>
                                    <RegisterStep2Page />
                                </GuestRoute>
                            </RouteWrapper>
                        }
                    />

                    {/* Только для авторизованных */}
                    <Route
                        path="/profile"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />

                    <Route
                        path="/users"
                        element={<RouteWrapper><UsersPage/></RouteWrapper>}
                    />

                    <Route
                        path="/notifications"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <NotificationsPage/>
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />

                    <Route
                        path="/my-requests"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <MyRequestsPage/>
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />

                    <Route
                        path="/teams/:teamId"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <TeamPublicPage/>
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />

                    <Route
                        path="/teams/:teamId/private"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <TeamPrivatePage/>
                                </ProtectedRoute>
                            </RouteWrapper>
                        }
                    />

                    <Route
                        path="/users/:username"
                        element={
                            <RouteWrapper>
                                <ProtectedRoute>
                                    <UserDetailPage/>
                                </ProtectedRoute>
                            </RouteWrapper>
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
