import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { fetchWithRetry } from '../utils/fetchWithRetry';

const AppContext = createContext();

// Temporarily hardcoded for testing - always use production backend
const API_URL = 'https://gatherly-backend-3vmv.onrender.com/api';

export const AppProvider = ({ children }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get auth token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        } : { 'Content-Type': 'application/json' };
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching events, token exists:', !!token);

            // Guest users: load from localStorage
            if (token?.startsWith('guest_')) {
                const savedEvents = localStorage.getItem('guestEvents');
                setEvents(savedEvents ? JSON.parse(savedEvents) : []);
                setLoading(false);
                return;
            }

            // Regular users: fetch from server
            console.log('Fetching from server with headers');
            const res = await fetchWithRetry(`${API_URL}/events`, {
                headers: getAuthHeaders()
            }, 3, 30000); // 3 retries, 30s timeout

            console.log('Fetch response status:', res.status);

            if (!res.ok) {
                if (res.status === 401) {
                    console.error('401 Unauthorized - clearing token');
                    // Token expired or invalid - just clear it, ProtectedRoute will handle redirect
                    localStorage.removeItem('token');
                    setEvents([]);
                    return;
                }
                throw new Error('Failed to fetch events');
            }
            const data = await res.json();
            console.log('Events fetched successfully:', data.length, 'events');
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Could not connect to server. Backend may be starting up, please wait...');
        } finally {
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token?.startsWith('guest_')) {
                const guestContacts = localStorage.getItem('guestContacts');
                setContacts(guestContacts ? JSON.parse(guestContacts) : []);
                return;
            }

            const res = await fetchWithRetry(`${API_URL}/contacts`, {
                headers: getAuthHeaders()
            }, 3, 30000); // 3 retries, 30s timeout
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Only fetch if we have a token
        if (!token) {
            setLoading(false);
            return;
        }

        fetchEvents();
        fetchContacts();

        // Only poll for authenticated users, not guest users
        if (!token.startsWith('guest_')) {
            const interval = setInterval(() => {
                // Double-check token still exists before polling
                const currentToken = localStorage.getItem('token');
                if (!currentToken) {
                    clearInterval(interval);
                    return;
                }

                fetchEvents();
                fetchContacts();
            }, 5000);

            // Keep backend alive - ping every 4 minutes to prevent Render spin-down
            const keepAliveInterval = setInterval(async () => {
                try {
                    await fetch(`${API_URL}/health`, { method: 'GET' });
                    console.log('Backend keep-alive ping sent');
                } catch (err) {
                    console.log('Keep-alive ping failed:', err);
                }
            }, 240000); // 4 minutes

            return () => {
                clearInterval(interval);
                clearInterval(keepAliveInterval);
            };
        }
    }, [user]); // Re-fetch when user changes (login/logout)

    const createEvent = async (eventData) => {
        const newEvent = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            guests: [],
            ...eventData,
        };

        // Optimistic update
        setEvents(prev => [newEvent, ...prev]);

        const token = localStorage.getItem('token');

        // Guest users: save to local storage
        if (token?.startsWith('guest_')) {
            const updatedEvents = [newEvent, ...events];
            localStorage.setItem('guestEvents', JSON.stringify(updatedEvents));
        } else {
            // Regular users: save to server
            try {
                const res = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(eventData), // Send only the event data fields
                });

                if (!res.ok) {
                    console.error('Failed to save event to server:', res.status);
                    // Revert optimistic update
                    setEvents(prev => prev.filter(e => e.id !== newEvent.id));
                    throw new Error('Failed to save event');
                }

                const savedEvent = await res.json();
                console.log('Event saved successfully:', savedEvent);

                // Replace optimistic event with server response
                setEvents(prev => prev.map(e => e.id === newEvent.id ? savedEvent : e));

                return savedEvent;
            } catch (err) {
                console.error('Error saving event:', err);
                // Revert optimistic update
                setEvents(prev => prev.filter(e => e.id !== newEvent.id));
                throw err;
            }
        }

        return newEvent;
    };

    const deleteEvent = async (eventId) => {
        // Optimistic update
        setEvents(prev => prev.filter(e => e.id !== eventId));

        try {
            const res = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                console.error('Failed to delete event on server:', res.status);
                // Revert optimistic update
                await fetchEvents();
                throw new Error('Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            // Revert optimistic update
            await fetchEvents();
            throw err;
        }
    };

    const getEvent = (eventId) => {
        return events.find(e => e.id === eventId);
    };

    const addGuest = async (eventId, guestData) => {
        const newGuest = {
            id: uuidv4(),
            addedAt: new Date().toISOString(),
            attended: false,
            attendedCount: 0,
            ...guestData
        };

        // Optimistic update
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return { ...event, guests: [...event.guests, newGuest] };
            }
            return event;
        }));

        try {
            const res = await fetch(`${API_URL}/events/${eventId}/guests`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(guestData)
            });

            if (!res.ok) {
                console.error('Failed to add guest to server:', res.status);
                // Revert optimistic update
                setEvents(prev => prev.map(event => {
                    if (event.id === eventId) {
                        return { ...event, guests: event.guests.filter(g => g.id !== newGuest.id) };
                    }
                    return event;
                }));
                throw new Error('Failed to add guest');
            }

            const savedGuest = await res.json();
            console.log('Guest added successfully:', savedGuest);

            // Update with server response (in case server modified the guest)
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    return {
                        ...event,
                        guests: event.guests.map(g => g.id === newGuest.id ? savedGuest : g)
                    };
                }
                return event;
            }));

            return savedGuest;
        } catch (err) {
            console.error('Error adding guest:', err);
            // Revert optimistic update
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    return { ...event, guests: event.guests.filter(g => g.id !== newGuest.id) };
                }
                return event;
            }));
            throw err;
        }
    };

    const markGuestAttended = async (eventId, guestId, count = 1) => {
        // Optimistic update
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    guests: event.guests.map(guest => {
                        if (guest.id === guestId) {
                            return {
                                ...guest,
                                attended: true,
                                attendedCount: (guest.attendedCount || 0) + count,
                                checkInTime: new Date().toISOString()
                            };
                        }
                        return guest;
                    })
                };
            }
            return event;
        }));

        await fetch(`${API_URL}/events/${eventId}/guests/${guestId}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });
    };

    const rsvpGuest = async (eventId, guestId, response) => {
        // Optimistic update
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    guests: event.guests.map(guest => {
                        if (guest.id === guestId) {
                            return {
                                ...guest,
                                rsvp: response,
                                rsvpTime: new Date().toISOString()
                            };
                        }
                        return guest;
                    })
                };
            }
            return event;
        }));

        await fetch(`${API_URL}/events/${eventId}/guests/${guestId}/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response })
        });
    };

    const addBulkGuests = async (eventId, guestsArray) => {
        const newGuests = guestsArray.map(guestData => ({
            id: uuidv4(),
            addedAt: new Date().toISOString(),
            attended: false,
            attendedCount: 0,
            ...guestData
        }));

        // Optimistic update
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return { ...event, guests: [...event.guests, ...newGuests] };
            }
            return event;
        }));

        try {
            // Use bulk endpoint
            const res = await fetch(`${API_URL}/events/${eventId}/guests/bulk`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ guests: guestsArray })
            });

            if (!res.ok) {
                console.error('Failed to add guests to server:', res.status);
                // Revert optimistic update
                setEvents(prev => prev.map(event => {
                    if (event.id === eventId) {
                        const guestIds = newGuests.map(g => g.id);
                        return { ...event, guests: event.guests.filter(g => !guestIds.includes(g.id)) };
                    }
                    return event;
                }));
                throw new Error('Failed to add guests');
            }

            const savedGuests = await res.json();
            console.log('Bulk guests added successfully');

            // Update with server response
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    // Replace optimistic guests with server guests
                    const nonNewGuests = event.guests.filter(g => !newGuests.some(ng => ng.id === g.id));
                    return { ...event, guests: [...nonNewGuests, ...savedGuests] };
                }
                return event;
            }));

            return savedGuests;
        } catch (err) {
            console.error('Error adding bulk guests:', err);
            // Revert optimistic update
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    const guestIds = newGuests.map(g => g.id);
                    return { ...event, guests: event.guests.filter(g => !guestIds.includes(g.id)) };
                }
                return event;
            }));
            throw err;
        }
    };

    const updateEvent = async (eventId, updatedEventData) => {
        // Optimistic update
        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return { ...event, ...updatedEventData };
            }
            return event;
        }));

        const token = localStorage.getItem('token');

        // Guest users: save to local storage
        if (token?.startsWith('guest_')) {
            const updatedEvents = events.map(event =>
                event.id === eventId ? { ...event, ...updatedEventData } : event
            );
            localStorage.setItem('guestEvents', JSON.stringify(updatedEvents));
        } else {
            // Regular users: save to server
            await fetch(`${API_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedEventData),
            });
        }
    };

    // Contact Library Functions
    const addContact = async (contactData) => {
        const token = localStorage.getItem('token');

        if (token?.startsWith('guest_')) {
            const newContact = { id: uuidv4(), ...contactData, addedAt: new Date().toISOString() };
            const updatedContacts = [...contacts, newContact];
            setContacts(updatedContacts);
            localStorage.setItem('guestContacts', JSON.stringify(updatedContacts));
            return newContact;
        }

        const res = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(contactData)
        });

        if (res.ok) {
            const newContact = await res.json();
            setContacts(prev => [...prev, newContact]);
            return newContact;
        }
    };

    const updateContact = async (contactId, contactData) => {
        const token = localStorage.getItem('token');

        if (token?.startsWith('guest_')) {
            const updatedContacts = contacts.map(c =>
                c.id === contactId ? { ...c, ...contactData } : c
            );
            setContacts(updatedContacts);
            localStorage.setItem('guestContacts', JSON.stringify(updatedContacts));
            return;
        }

        await fetch(`${API_URL}/contacts/${contactId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(contactData)
        });

        setContacts(prev => prev.map(c =>
            c.id === contactId ? { ...c, ...contactData } : c
        ));
    };

    const deleteContact = async (contactId) => {
        const token = localStorage.getItem('token');

        if (token?.startsWith('guest_')) {
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            setContacts(updatedContacts);
            localStorage.setItem('guestContacts', JSON.stringify(updatedContacts));
            return;
        }

        await fetch(`${API_URL}/contacts/${contactId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        setContacts(prev => prev.filter(c => c.id !== contactId));
    };

    const saveGuestToContacts = async (guestData) => {
        // Check if contact already exists by phone
        const existing = contacts.find(c => c.phone && c.phone === guestData.phone);
        if (existing) return existing;

        return await addContact({
            name: guestData.name,
            phone: guestData.phone || '',
            email: guestData.email || '',
            notes: ''
        });
    };

    // Public Invitation Functions
    const fetchPublicEvent = async (eventId) => {
        // Always try localStorage first (works for everyone, logged in or not)
        // This allows the event creator's localStorage to be the source of truth
        const guestEvents = localStorage.getItem('guestEvents');
        if (guestEvents) {
            const events = JSON.parse(guestEvents);
            const event = events.find(e => e.id === eventId);
            if (event) {
                return {
                    id: event.id,
                    title: event.title,
                    venue: event.venue,
                    date: event.date,
                    time: event.time,
                    description: event.description
                };
            }
        }

        // Try server for authenticated users or as fallback
        try {
            const res = await fetch(`${API_URL}/public/events/${eventId}`);
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.error('Failed to fetch public event:', err);
        }

        throw new Error('Event not found');
    };

    const submitPublicRSVP = async (eventId, rsvpData) => {
        // Always try localStorage first (event might be stored there)
        const guestEvents = localStorage.getItem('guestEvents');
        if (guestEvents) {
            const events = JSON.parse(guestEvents);
            const eventIndex = events.findIndex(e => e.id === eventId);

            if (eventIndex !== -1) {
                const event = events[eventIndex];

                // Check for existing guest
                let guest = event.guests.find(g =>
                    (rsvpData.phone && g.phone === rsvpData.phone) ||
                    (rsvpData.email && g.email === rsvpData.email)
                );

                if (guest) {
                    // Update existing
                    guest.rsvp = rsvpData.response === 'yes' ? true : rsvpData.response === 'no' ? false : null;
                    guest.rsvpTime = new Date().toISOString();
                    guest.plusOnes = rsvpData.plusOnes || 0;
                    guest.dietaryRestrictions = rsvpData.dietaryRestrictions || '';
                } else {
                    // Add new guest
                    const newGuest = {
                        id: Date.now().toString(),
                        name: rsvpData.name,
                        phone: rsvpData.phone || '',
                        email: rsvpData.email || '',
                        rsvp: rsvpData.response === 'yes' ? true : rsvpData.response === 'no' ? false : null,
                        rsvpTime: new Date().toISOString(),
                        plusOnes: rsvpData.plusOnes || 0,
                        dietaryRestrictions: rsvpData.dietaryRestrictions || '',
                        addedAt: new Date().toISOString(),
                        attended: false,
                        attendedCount: 0,
                        source: 'public_invitation'
                    };
                    event.guests.push(newGuest);
                }

                localStorage.setItem('guestEvents', JSON.stringify(events));
                return { success: true, message: 'RSVP submitted successfully' };
            }
        }

        // Try server for authenticated users
        try {
            const res = await fetch(`${API_URL}/public/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rsvpData)
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.error('Failed to submit RSVP:', err);
        }

        throw new Error('Failed to submit RSVP');
    };

    return (
        <AppContext.Provider value={{
            events,
            contacts,
            loading,
            error,
            createEvent,
            deleteEvent,
            getEvent,
            addGuest,
            addBulkGuests,
            markGuestAttended,
            rsvpGuest,
            updateEvent,
            fetchContacts,
            addContact,
            updateContact,
            deleteContact,
            saveGuestToContacts,
            fetchPublicEvent,
            submitPublicRSVP
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
