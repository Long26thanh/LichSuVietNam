import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts";
import { Fragment } from "react";
import routes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useAutoSessionSwitch from "./hooks/useAutoSessionSwitch";
import config from "./config";

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

function AppContent() {
    useAutoSessionSwitch();
    return (
        <div className="App">
            <Routes>
                {routes.map((route, index) => {
                    const Page = route.page;
                    let Layout = MainLayout;
                    if (route.layout) {
                        Layout = route.layout;
                    } else if (route.layout === null) {
                        Layout = Fragment;
                    }

                    // Kiểm tra nếu là route admin cần bảo vệ
                    const isAdminRoute =
                        route.path.startsWith("/admin") &&
                        route.path !== config.routes.admin;

                    return (
                        <Route
                            key={index}
                            path={route.path}
                            element={
                                isAdminRoute ? (
                                    <ProtectedRoute
                                        requireAuth={true}
                                        requireRole="admin"
                                        requireSessionType="admin"
                                        redirectTo={config.routes.admin}
                                    >
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    </ProtectedRoute>
                                ) : (
                                    <Layout>
                                        <Page />
                                    </Layout>
                                )
                            }
                        />
                    );
                })}
            </Routes>
        </div>
    );
}

export default App;
