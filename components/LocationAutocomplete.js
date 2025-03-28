import React, { useState, useEffect } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';

export default function LocationAutocomplete({ value, onChange, onSelect, styles }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if the Google Maps script is loaded
    if (window.google && window.google.maps) {
      setScriptLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          setScriptLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, []);

  if (!scriptLoaded) {
    return <input 
      placeholder="Loading location search..." 
      className={styles.locationInput} 
      disabled 
    />;
  }

  return (
    <PlacesAutocomplete
      value={value}
      onChange={onChange}
      onSelect={onSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className={styles.locationContainer}>
          <input
            {...getInputProps({
              placeholder: "Enter your location...",
              className: styles.locationInput,
              id: "location",
            })}
          />
          <div className={styles.suggestionsContainer}>
            {loading && <div>Loading...</div>}
            {suggestions.map((suggestion, idx) => {
              const style = {
                backgroundColor: suggestion.active ? "#f0f0f0" : "#fff",
                padding: "5px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              };
              return (
                <div key={idx} {...getSuggestionItemProps(suggestion, { style })}>
                  {suggestion.description}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
}