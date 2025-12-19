import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ManagerDashboard from './pages/ManagerDashboard';
import EventDetailsTabs from './pages/EventDetailsTabs';
import GuestEventView from './pages/GuestEventView';
import Scanner from './pages/Scanner';
import RSVP from './pages/RSVP';
import PublicInvitation from './pages/PublicInvitation';
import EventWall from './pages/EventWall';

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

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <BrowserRouter>
                    <BackButtonHandler />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/rsvp/:eventId/:guestId" element={<RSVP />} />
                        <Route path="/invite/:id" element={<PublicInvitation />} />

                        {/* Protected routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Landing />
                            </ProtectedRoute>
                        } />
                        <Route path="/manager" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ManagerDashboard />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/event/:id" element={
                            <ProtectedRoute>
                                <Layout>
                                    <EventDetailsTabs />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/guest/event/:id" element={
                            <ProtectedRoute>
                                <GuestEventView />
                            </ProtectedRoute>
                        } />
                        <Route path="/event/:eventId/wall" element={
                            <ProtectedRoute>
                                <EventWall />
                            </ProtectedRoute>
                        } />
                        <Route path="/scanner" element={
                            <ProtectedRoute>
                                <Scanner />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
