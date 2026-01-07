import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import API_URL from '../config/api';

const AppContext = createContext();

// Temporarily hardcoded for testing - always use production backend

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
            }, 3, 30000);

            console.log('Fetch response status:', res.status);

            if (!res.ok) {
                if (res.status === 401) {
                    console.error('401 Unauthorized - clearing token');
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
            console.log('📞 FETCH-CONTACTS: Starting fetch...');
            const token = localStorage.getItem('token');
            if (token?.startsWith('guest_')) {
                const guestContacts = localStorage.getItem('guestContacts');
                setContacts(guestContacts ? JSON.parse(guestContacts) : []);
                console.log('📞 FETCH-CONTACTS: Loaded guest contacts from localStorage');
                return;
            }

            const res = await fetchWithRetry(`${API_URL}/contacts`, {
                headers: getAuthHeaders()
            }, 3, 30000);
            if (res.ok) {
                const data = await res.json();
                console.log('✅ FETCH-CONTACTS: Received', data.length, 'contacts from server');
                setContacts(data);
            } else {
                console.error('❌ FETCH-CONTACTS: Request failed with status', res.status);
            }
        } catch (err) {
            console.error('❌ FETCH-CONTACTS: Error -', err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        fetchEvents();
        fetchContacts();

        if (!token.startsWith('guest_')) {
            const interval = setInterval(() => {
                const currentToken = localStorage.getItem('token');
                if (!currentToken) {
                    clearInterval(interval);
                    return;
                }
                fetchEvents();
                fetchContacts();
            }, 5000);

            const keepAliveInterval = setInterval(async () => {
                try {
                    await fetch(`${API_URL}/health`, { method: 'GET' });
                    console.log('Backend keep-alive ping sent');
                } catch (err) {
                    console.log('Keep-alive ping failed:', err);
                }
            }, 240000);

            return () => {
                clearInterval(interval);
                clearInterval(keepAliveInterval);
            };
        }
    }, [user]);

    const createEvent = async (eventData) => {
        const newEvent = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            guests: [],
            ...eventData,
        };

        setEvents(prev => [newEvent, ...prev]);

        const token = localStorage.getItem('token');

        if (token?.startsWith('guest_')) {
            const updatedEvents = [newEvent, ...events];
            localStorage.setItem('guestEvents', JSON.stringify(updatedEvents));
            return newEvent;
        } else {
            try {
                const res = await fetch(`${API_URL}/events`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(eventData),
                });

                if (!res.ok) {
                    console.error('Failed to save event to server:', res.status);
                    setEvents(prev => prev.filter(e => e.id !== newEvent.id));
                    throw new Error('Failed to save event');
                }

                const savedEvent = await res.json();
                console.log('Event saved successfully:', savedEvent);
                setEvents(prev => prev.map(e => e.id === newEvent.id ? savedEvent : e));
                return savedEvent;
            } catch (err) {
                console.error('Error saving event:', err);
                setEvents(prev => prev.filter(e => e.id !== newEvent.id));
                throw err;
            }
        }
    };

    const deleteEvent = async (eventId) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));

        try {
            const res = await fetch(`${API_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                console.error('Failed to delete event on server:', res.status);
                await fetchEvents();
                throw new Error('Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
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
                body: JSON.stringify({
                    ...guestData,
                    email: guestData.email && guestData.email.trim() ? guestData.email : null,
                    phone: guestData.phone && guestData.phone.trim() ? guestData.phone : null
                })
            });

            if (!res.ok) {
                console.error('Failed to add guest to server:', res.status);
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
            console.log('👤 ADD-GUEST: Guest contact_id:', savedGuest.contact_id);

            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    return {
                        ...event,
                        guests: event.guests.map(g => g.id === newGuest.id ? savedGuest : g)
                    };
                }
                return event;
            }));

            // Refresh contacts to show newly auto-saved contact
            console.log('👤 ADD-GUEST: Calling fetchContacts to refresh...');
            await fetchContacts();
            console.log('👤 ADD-GUEST: fetchContacts completed');

            return savedGuest;
        } catch (err) {
            console.error('Error adding guest:', err);
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
        console.log('markGuestAttended called:', { eventId, guestId, count });

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

        try {
            const response = await fetch(`${API_URL}/events/${eventId}/guests/${guestId}/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ count })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Check-in API failed:', error);
                throw new Error(error.error || 'Failed to check in guest');
            }

            console.log('Check-in successful');
            await fetchEvents();
        } catch (error) {
            console.error('markGuestAttended error:', error);
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    return {
                        ...event,
                        guests: event.guests.map(guest => {
                            if (guest.id === guestId) {
                                return {
                                    ...guest,
                                    attended: false,
                                    attendedCount: Math.max(0, (guest.attendedCount || 0) - count),
                                    checkInTime: null
                                };
                            }
                            return guest;
                        })
                    };
                }
                return event;
            }));
            throw error;
        }
    };

    const rsvpGuest = async (eventId, guestId, response) => {
        const previousEvents = events;

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

        try {
            const res = await fetch(`${API_URL}/events/${eventId}/guests/${guestId}/rsvp`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rsvp: response })
            });

            if (!res.ok) {
                throw new Error('Failed to update RSVP');
            }
        } catch (error) {
            console.error('RSVP update failed:', error);
            setEvents(previousEvents);
            throw error;
        }
    };

    const addBulkGuests = async (eventId, guestsArray) => {
        const newGuests = guestsArray.map(guestData => ({
            id: uuidv4(),
            addedAt: new Date().toISOString(),
            attended: false,
            attendedCount: 0,
            ...guestData
        }));

        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return { ...event, guests: [...event.guests, ...newGuests] };
            }
            return event;
        }));

        try {
            const res = await fetch(`${API_URL}/events/${eventId}/guests/bulk`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ guests: guestsArray })
            });

            if (!res.ok) {
                console.error('Failed to add guests to server:', res.status);
                setEvents(prev => prev.map(event => {
                    if (event.id === eventId) {
                        const guestIds = newGuests.map(g => g.id);
                        return { ...event, guests: event.guests.filter(g => !guestIds.includes(g.id)) };
                    }
                    return event;
                }));
                throw new Error('Failed to add guests');
            }

            const data = await res.json();
            const savedGuests = data.added || data;

            if (data.skipped && data.skipped.length > 0) {
                console.log(`Skipped ${data.skipped.length} duplicate guests:`, data.skipped);
            }

            console.log('Bulk guests added successfully');

            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    const nonNewGuests = event.guests.filter(g => !newGuests.some(ng => ng.id === g.id));
                    return { ...event, guests: [...nonNewGuests, ...savedGuests] };
                }
                return event;
            }));

            return savedGuests;
        } catch (err) {
            console.error('Error adding bulk guests:', err);
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

    const deleteGuest = async (eventId, guestId) => {
        let deletedGuest = null;

        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                deletedGuest = event.guests.find(g => g.id === guestId);
                return { ...event, guests: event.guests.filter(g => g.id !== guestId) };
            }
            return event;
        }));

        try {
            const res = await fetch(`${API_URL}/events/${eventId}/guests/${guestId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!res.ok) {
                console.error('Failed to delete guest from server:', res.status);
                if (deletedGuest) {
                    setEvents(prev => prev.map(event => {
                        if (event.id === eventId) {
                            return { ...event, guests: [...event.guests, deletedGuest] };
                        }
                        return event;
                    }));
                }
                throw new Error('Failed to delete guest');
            }

            console.log('Guest deleted successfully');
        } catch (err) {
            console.error('Error deleting guest:', err);
            if (deletedGuest) {
                setEvents(prev => prev.map(event => {
                    if (event.id === eventId) {
                        return { ...event, guests: [...event.guests, deletedGuest] };
                    }
                    return event;
                }));
            }
            throw err;
        }
    };

    const updateEvent = async (eventId, updatedEventData) => {
        const originalEvents = [...events];

        setEvents(prev => prev.map(event => {
            if (event.id === eventId) {
                return { ...event, ...updatedEventData };
            }
            return event;
        }));

        const token = localStorage.getItem('token');

        if (token?.startsWith('guest_')) {
            const updatedEvents = events.map(event =>
                event.id === eventId ? { ...event, ...updatedEventData } : event
            );
            localStorage.setItem('guestEvents', JSON.stringify(updatedEvents));
        } else {
            try {
                const res = await fetch(`${API_URL}/events/${eventId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(updatedEventData),
                });

                if (!res.ok) {
                    console.error('Failed to update event, reverting:', res.status);
                    setEvents(originalEvents);
                    throw new Error('Failed to update event');
                }
            } catch (error) {
                console.error('Error updating event:', error);
                setEvents(originalEvents);
                throw error;
            }
        }
    };

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

    const addContactsToEvent = async (eventId, contactIds) => {
        try {
            const res = await fetch(`${API_URL}/contacts/add-to-event/${eventId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ contactIds })
            });

            if (!res.ok) {
                throw new Error('Failed to add contacts to event');
            }

            const data = await res.json();
            await fetchEvents();
            return data;
        } catch (err) {
            console.error('Error adding contacts to event:', err);
            throw err;
        }
    };

    const saveGuestToContacts = async (guestData) => {
        const existing = contacts.find(c => c.phone && c.phone === guestData.phone);
        if (existing) return existing;

        return await addContact({
            name: guestData.name,
            phone: guestData.phone || '',
            email: guestData.email || '',
            notes: ''
        });
    };

    const fetchPublicEvent = async (eventId) => {
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
        const guestEvents = localStorage.getItem('guestEvents');
        if (guestEvents) {
            const events = JSON.parse(guestEvents);
            const eventIndex = events.findIndex(e => e.id === eventId);

            if (eventIndex !== -1) {
                const event = events[eventIndex];

                let guest = event.guests.find(g =>
                    (rsvpData.phone && g.phone === rsvpData.phone) ||
                    (rsvpData.email && g.email === rsvpData.email)
                );

                if (guest) {
                    guest.rsvp = rsvpData.response === 'yes' ? true : rsvpData.response === 'no' ? false : null;
                    guest.rsvpTime = new Date().toISOString();
                    guest.plusOnes = rsvpData.plusOnes || 0;
                    guest.dietaryRestrictions = rsvpData.dietaryRestrictions || '';
                } else {
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
            API_URL,
            events,
            contacts,
            loading,
            error,
            createEvent,
            deleteEvent,
            getEvent,
            addGuest,
            addBulkGuests,
            deleteGuest,
            markGuestAttended,
            rsvpGuest,
            updateEvent,
            fetchContacts,
            addContact,
            updateContact,
            deleteContact,
            addContactsToEvent,
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
