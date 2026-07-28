import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global safety nets: async errors and rejected promises never reach a React
// error boundary, so without these an unhandled rejection can wedge the app or
// surface to reviewers as a silent crash. Log them so they show up in
// Xcode/Logcat, and swallow them so they don't take down the whole session.
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error || event.message)
})

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Prevent the default "uncaught" behavior that some webviews treat as fatal.
    event.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
