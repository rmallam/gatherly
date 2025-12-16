import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <nav style={{
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <Header showAuth={true} />
            </nav>

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
            <main className="flex-1 container py-8">
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '2rem 1rem',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem'
            }}>
                <p>Gatherly &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default Layout;
