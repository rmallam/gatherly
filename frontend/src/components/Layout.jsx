import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import AIAssistantWidget from './AIAssistantWidget';

const Layout = ({ children }) => {
    const { user } = useAuth();

    // Feature toggle for AI Helper Tool
    const ENABLE_AI_HELPER = true;

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
                paddingBottom: ENABLE_AI_HELPER ? 'calc(100px + env(safe-area-inset-bottom))' : 'calc(80px + env(safe-area-inset-bottom))', 
                overflow: 'auto'
            }}>
                {children}
            </main>

            {/* AI Assistant Chatbot overlay */}
            {ENABLE_AI_HELPER && !user?.isGuest && <AIAssistantWidget />}

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
};

export default Layout;
