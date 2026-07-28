import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import pushNotificationService from './services/PushNotificationService';

// Eagerly loaded: the first screens a user hits on cold start.
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';

// Everything else is code-split so it isn't shipped in the initial bundle.
const Landing = lazy(() => import('./pages/Landing'));
const Signup = lazy(() => import('./pages/Signup'));
const EventDetailsTabs = lazy(() => import('./pages/EventDetailsTabs'));
const GuestEventView = lazy(() => import('./pages/GuestEventView'));
const Scanner = lazy(() => import('./pages/Scanner'));
const RSVP = lazy(() => import('./pages/RSVP'));
const PublicInvitation = lazy(() => import('./pages/PublicInvitation'));
const EventWall = lazy(() => import('./pages/EventWall'));
const Profile = lazy(() => import('./pages/Profile'));
const NotificationList = lazy(() => import('./pages/NotificationList'));
const MyContacts = lazy(() => import('./pages/MyContacts'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaywallPage = lazy(() => import('./pages/PaywallPage'));

// Full-screen fallback while a route chunk downloads.
const RouteLoading = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#8b5cf6' }}>
        Loading…
    </div>
);

import { handleAppBackButton } from './hooks/useBackButton';

// Back button handler component
function BackButtonHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let backButtonHandler;
        
        const setupListener = async () => {
            backButtonHandler = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                // Let modals handle the back button first
                if (handleAppBackButton()) {
                    return;
                }

                // If on home/dashboard, exit app
                if (location.pathname === '/' || location.pathname === '/manager') {
                    CapacitorApp.exitApp();
                } else if (canGoBack || (window.history.state && window.history.state.idx > 0)) {
                    // Navigate back
                    navigate(-1);
                } else {
                    // Go to home
                    navigate('/');
                }
            });
        };
        
        setupListener();

        return () => {
            if (backButtonHandler) {
                backButtonHandler.remove();
            }
        };
    }, [navigate, location]);

    return null;
}

// Deep link handler component
function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        let urlOpenHandler;

        // Handle app URL when app is opened from a deep link
        const setupListener = async () => {
            urlOpenHandler = await CapacitorApp.addListener('appUrlOpen', (data) => {
                console.log('App opened with URL:', data.url);

                try {
                    // Handle both https:// and hosteze:// schemes
                    let path, search;

                    if (data.url.startsWith('hosteze://')) {
                        // Custom scheme: hosteze://reset-password?token=abc123
                        const urlWithoutScheme = data.url.replace('hosteze://', '');
                        const [pathPart, queryPart] = urlWithoutScheme.split('?');
                        path = '/' + pathPart;
                        search = queryPart ? '?' + queryPart : '';
                    } else {
                        // HTTPS scheme: https://events.hosteze.app/reset-password?token=abc123
                        const url = new URL(data.url);
                        path = url.pathname;
                        search = url.search;
                    }

                    console.log('Navigating to:', path + search);
                    // Navigate to the path with query parameters
                    navigate(path + search);
                } catch (error) {
                    console.error('Error parsing deep link:', error);
                }
            });
        };

        setupListener();

        return () => {
            if (urlOpenHandler) {
                urlOpenHandler.remove();
            }
        };
    }, [navigate]);

    return null;
}

function App() {
    // Initialize OneSignal on app start
    useEffect(() => {
        pushNotificationService.initialize();
    }, []);

    return (
        <ErrorBoundary>
        <AuthProvider>
            <ThemeProvider>
                <AppProvider>
                    <BrowserRouter>
                        <BackButtonHandler />
                        <DeepLinkHandler />
                        <Suspense fallback={<RouteLoading />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/rsvp/:eventId/:guestId" element={<RSVP />} />
                            <Route path="/invite/:id" element={<PublicInvitation />} />

                            {/* Protected routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <ManagerDashboard />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            {/* Redirect /manager to / to avoid duplicate routes */}
                            <Route path="/manager" element={<Navigate to="/" replace />} />
                            <Route path="/event/:id" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <EventDetailsTabs />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/guest/event/:id" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <GuestEventView />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/event/:eventId/wall" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <EventWall />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/scanner" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Scanner />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Profile />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/notifications" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <NotificationList />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/contacts" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <MyContacts />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <AdminDashboard />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                            <Route path="/pro" element={
                                <ProtectedRoute>
                                    <Layout>
                                        <PaywallPage />
                                    </Layout>
                                </ProtectedRoute>
                            } />
                        </Routes>
                        </Suspense>
                    </BrowserRouter>
                </AppProvider>
            </ThemeProvider>
        </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
