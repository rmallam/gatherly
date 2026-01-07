import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import pushNotificationService from './services/PushNotificationService';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ManagerDashboard from './pages/ManagerDashboard';
import EventDetailsTabs from './pages/EventDetailsTabs';
import GuestEventView from './pages/GuestEventView';
import Scanner from './pages/Scanner';
import RSVP from './pages/RSVP';
import PublicInvitation from './pages/PublicInvitation';
import EventWall from './pages/EventWall';
import Profile from './pages/Profile';
import NotificationList from './pages/NotificationList';
import MyContacts from './pages/MyContacts';
import AdminDashboard from './pages/AdminDashboard';

// Back button handler component
function BackButtonHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            // If on home/dashboard, exit app
            if (location.pathname === '/' || location.pathname === '/manager') {
                CapacitorApp.exitApp();
            } else if (canGoBack) {
                // Navigate back
                navigate(-1);
            } else {
                // Go to home
                navigate('/');
            }
        });

        return () => {
            handleBackButton.remove();
        };
    }, [navigate, location]);

    return null;
}

// Deep link handler component
function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle app URL when app is opened from a deep link
        const handleAppUrlOpen = CapacitorApp.addListener('appUrlOpen', (data) => {
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
                    // HTTPS scheme: https://gatherly-backend-3vmv.onrender.com/reset-password?token=abc123
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

        return () => {
            handleAppUrlOpen.remove();
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
        <ThemeProvider>
            <AuthProvider>
                <AppProvider>
                    <BrowserRouter>
                        <BackButtonHandler />
                        <DeepLinkHandler />
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
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
                        </Routes>
                    </BrowserRouter>
                </AppProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
