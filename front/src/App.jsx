import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GlobalLoadingProvider } from "./components/GlobalLoading";
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

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <GlobalLoadingProvider>
                    <Router>
                        <div className="app-container">
                            <Header />
                            <main className="main-content" style={{ position: 'relative' }}>
                            <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/teams" element={<TeamsPage/>} />
                    <Route
                        path="/my-teams"
                        element={
                            <ProtectedRoute>
                                <MyTeamsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams/create"
                        element={
                            <ProtectedRoute>
                                <CreateTeamPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="about" element={<AboutPage/>}/>

                    {/* Только для НЕавторизованных */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LogInPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/forgot"
                        element={
                            <GuestRoute>
                                <ForgotCredentialsPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register-step1"
                        element={
                            <GuestRoute>
                                <RegisterStep1Page />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register-step2"
                        element={
                            <GuestRoute>
                                <RegisterStep2Page />
                            </GuestRoute>
                        }
                    />

                    {/* Только для авторизованных */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users"
                        element={<UsersPage/>}
                    />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <NotificationsPage/>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-requests"
                        element={
                            <ProtectedRoute>
                                <MyRequestsPage/>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teams/:teamId"
                        element={
                            <ProtectedRoute>
                                <TeamPublicPage/>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/teams/:teamId/private"
                        element={
                            <ProtectedRoute>
                                <TeamPrivatePage/>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/users/:username"
                        element={
                            <ProtectedRoute>
                                <UserDetailPage/>
                            </ProtectedRoute>
                        }
                    />

                            </Routes>
                            </main>
                            <Footer />
                        </div>
                    </Router>
                </GlobalLoadingProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
