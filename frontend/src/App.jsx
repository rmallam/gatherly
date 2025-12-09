import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Scanner from './pages/Scanner';
import RSVP from './pages/RSVP';
import PublicInvitation from './pages/PublicInvitation';

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <BrowserRouter>
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
                                    <Landing />
                                </Layout>
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
                        <Route path="/scanner" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Scanner />
                                </Layout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
