import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import AIAssistantWidget from './AIAssistantWidget';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header showAuth={true} />

            {/* Guest User Banner */}
            {user?.isGuest && (
                <div style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    👋 Viewing as Guest
                </div>
            )}

            {/* Main Content */}
            <main style={{
                flex: 1,
                paddingBottom: 'calc(100px + env(safe-area-inset-bottom))', // Increased to clear AIAssistantWidget
                overflow: 'auto'
            }}>
                {children}
            </main>

            {/* AI Assistant Chatbot overlay */}
            {!user?.isGuest && <AIAssistantWidget />}

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
};

export default Layout;
