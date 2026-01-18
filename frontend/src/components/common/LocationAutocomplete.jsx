import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

// Global script loading promise to prevent multiple injections
let scriptLoadingPromise = null;

const loadGoogleMapsScript = (apiKey) => {
    if (window.google && window.google.maps && window.google.maps.places) {
        return Promise.resolve();
    }
    if (scriptLoadingPromise) {
        return scriptLoadingPromise;
    }

    scriptLoadingPromise = new Promise((resolve, reject) => {
        // Define global callback
        const callbackName = '__googleMapsCallback';
        window[callbackName] = () => {
            resolve();
            delete window[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = (err) => {
            reject(err);
            delete window[callbackName];
        };
        document.head.appendChild(script);
    });

    return scriptLoadingPromise;
};

const LocationAutocomplete = ({ value, onChange, onSelect, placeholder = "Search for a location", className, style }) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scriptError, setScriptError] = useState(null);

    // Attempt to get API key from env
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            console.warn("Google Maps API Key is missing. Please set VITE_GOOGLE_MAPS_API_KEY.");
            return;
        }

        let isMounted = true;

        const initAutocomplete = async () => {
            try {
                setIsLoading(true);
                await loadGoogleMapsScript(apiKey);

                if (!isMounted || !inputRef.current) return;

                if (!window.google || !window.google.maps) {
                    console.error("Google Maps API loaded but 'window.google.maps' is not available.");
                    setScriptError("Maps API error");
                    return;
                }

                if (!window.google.maps.places) {
                    console.error("Google Maps API loaded but 'places' library is missing. Please ensure 'Places API' is enabled in Google Cloud Console.");
                    setScriptError("Places API missing");
                    return;
                }

                autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: ['establishment', 'geocode'],
                    fields: ['formatted_address', 'place_id', 'geometry', 'name']
                });

                autocompleteRef.current.addListener('place_changed', () => {
                    if (!isMounted) return;
                    const place = autocompleteRef.current.getPlace();

                    if (onSelect) {
                        onSelect(place);
                    } else if (onChange && place.formatted_address) {
                        // Fallback if no specific selection handler
                        onChange(place.formatted_address);
                    }
                });
            } catch (err) {
                console.error("Failed to load Google Maps API", err);
                if (isMounted) setScriptError("Failed to load maps");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initAutocomplete();

        return () => {
            isMounted = false;
            // Cleanup listeners if possible, though Autocomplete doesn't have a direct 'remove' method easier than clearing instance
        };
    }, [apiKey]);

    // Handle manual input changes
    const handleInputChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                className={className || "form-input"}
                placeholder={placeholder}
                style={{
                    ...style,
                    paddingRight: isLoading ? '2.5rem' : '1rem'
                }}
                disabled={!apiKey || !!scriptError}
            />
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                }}>
                    <Loader size={16} className="spin" style={{ color: 'var(--text-tertiary)' }} />
                </div>
            )}
            {(!apiKey || scriptError) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', mt: '4px' }}>
                    {!apiKey ? 'Map configuration missing' : 'Maps unavailable'}
                </div>
            )}
        </div>
    );
};

export default LocationAutocomplete;
