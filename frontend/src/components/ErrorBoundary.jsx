import React from 'react';

/**
 * App-wide error boundary.
 *
 * Without this, any unhandled render error unmounts the whole React tree and
 * leaves a blank white screen — which an App Store / Play Store reviewer will
 * report as "the app crashed". This catches those errors and shows a recovery
 * screen with a "Try again" action instead.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log so crashes are visible in Xcode/Logcat and any remote logging.
        console.error('Uncaught UI error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = () => {
        // Full reload back to a known-good route.
        window.location.assign('/');
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.emoji}>😕</div>
                    <h1 style={styles.title}>Something went wrong</h1>
                    <p style={styles.text}>
                        The app hit an unexpected error. You can try again — your data is safe.
                    </p>
                    <button style={styles.primaryBtn} onClick={this.handleReset}>
                        Try again
                    </button>
                    <button style={styles.secondaryBtn} onClick={this.handleReload}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f5f5f7',
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    card: {
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    },
    emoji: { fontSize: '48px', marginBottom: '12px' },
    title: { fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#1a1a1c' },
    text: { fontSize: '15px', lineHeight: 1.5, color: '#6b7280', margin: '0 0 24px' },
    primaryBtn: {
        display: 'block',
        width: '100%',
        padding: '14px',
        marginBottom: '12px',
        border: 'none',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    secondaryBtn: {
        display: 'block',
        width: '100%',
        padding: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        background: '#fff',
        color: '#374151',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export default ErrorBoundary;
