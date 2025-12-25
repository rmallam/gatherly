import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, ScanLine, Bell, Users } from 'lucide-react';
import pushNotificationService from '../services/PushNotificationService';
import './BottomNavigation.css';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Fetch unread notification count
    React.useEffect(() => {
        const fetchUnreadCount = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const count = await pushNotificationService.getUnreadCount(token);
                setUnreadCount(count);
            }
        };

        fetchUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/',
            isActive: location.pathname === '/'
        },
        {
            id: 'events',
            label: 'Events',
            icon: Calendar,
            path: '/manager',
            isActive: location.pathname.startsWith('/manager') || location.pathname.startsWith('/event')
        },
        {
            id: 'scanner',
            label: 'Scanner',
            icon: ScanLine,
            path: '/scanner',
            isActive: location.pathname === '/scanner'
        },
        {
            id: 'contacts',
            label: 'Contacts',
            icon: Users,
            path: '/contacts',
            isActive: location.pathname === '/contacts'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: Bell,
            path: '/notifications',
            isActive: location.pathname === '/notifications',
            badge: unreadCount
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <nav className="bottom-navigation">
            <div className="bottom-nav-container">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`nav-item ${item.isActive ? 'active' : ''}`}
                        >
                            <div className="nav-icon-wrapper">
                                <Icon size={24} className="nav-icon" />
                                {item.badge > 0 && (
                                    <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                )}
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;
