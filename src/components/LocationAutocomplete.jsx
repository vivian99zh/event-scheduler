import { useState, useEffect, useRef } from "react";
import {
  TextField,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";

const LocationAutocomplete = ({ value, onChange, label, required, disabled }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Clean German address from Nominatim result
  const cleanGermanAddress = (addressData) => {
    if (!addressData) return "";

    const parts = addressData.display_name.split(",").map((p) => p.trim());

    let street = "";
    let houseNumber = "";
    let postalCode = "";
    let city = "";

    // Extract from address details if available
    if (addressData.address) {
      const addr = addressData.address;
      street = addr.road || addr.pedestrian || addr.footway || "";
      houseNumber = addr.house_number || "";
      postalCode = addr.postcode || "";
      city = addr.city || addr.town || addr.village || addr.municipality || "";

      // If no city found, try locality
      if (!city) {
        city = addr.locality || addr.suburb || "";
      }
    }

    // Build clean address
    if (street || postalCode || city) {
      let cleanAddress = "";

      // Add street and house number
      if (street) {
        cleanAddress += street;
        if (houseNumber) {
          cleanAddress += ` ${houseNumber}`;
        }
      } else {
        // Fallback: try to get street from display_name
        const firstPart = parts[0] || "";
        const match = firstPart.match(/^(.+?)\s*(\d+[a-z]?)?$/);
        if (match) {
          cleanAddress += match[1] || "";
          if (match[2]) {
            cleanAddress += ` ${match[2]}`;
          }
        }
      }

      // Add postal code and city
      if (postalCode || city) {
        if (cleanAddress) cleanAddress += ", ";
        if (postalCode) {
          cleanAddress += postalCode;
          if (city) cleanAddress += ` ${city}`;
        } else if (city) {
          cleanAddress += city;
        }
      }

      return cleanAddress || parts[0] || "";
    }

    // Fallback: clean the display_name manually
    let cleaned = addressData.display_name
      .replace(/, Deutschland$/, "")
      .replace(/, Germany$/, "")
      .replace(/, Deutschland,?/, "")
      .replace(/, Germany,?/, "");

    // Remove extra administrative areas (keep only essential parts)
    const cleanedParts = cleaned.split(",").map((p) => p.trim());
    if (cleanedParts.length > 3) {
      // Keep first part (street) and last 2 parts (postal code + city)
      const first = cleanedParts[0];
      const last = cleanedParts.slice(-2).join(", ");
      cleaned = `${first}, ${last}`;
    }

    return cleaned;
  };

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=de`,
      );
      if (!res.ok) throw new Error("failed to fetch");
      const data = await res.json();

      // Clean each suggestion
      const cleanedSuggestions = data.map((item) => ({
        ...item,
        display_name: cleanGermanAddress(item),
      }));

      setSuggestions(cleanedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(false);

    onChange({
      target: {
        name: "location",
        value: value,
      },
    });

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    const address = suggestion.display_name;
    setInputValue(address);
    setShowSuggestions(false);

    onChange({
      target: {
        name: "location",
        value: address,
      },
    });
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", overflow: "visible" }}>
      <TextField
        fullWidth
        label={label || "Location"}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        helperText="e.g., Lorenzweg 5, 12099 Berlin"
        slotProps={{
          endAdornment: loading && <CircularProgress size={20} />,
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper className="absolute top-full left-0 right-0 z-50 mt-0 max-h-75 overflow-auto shadow-lg">
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <LocationOn sx={{ mr: 2, color: "text.secondary" }} />
                <ListItemText primary={suggestion.display_name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default LocationAutocomplete;
