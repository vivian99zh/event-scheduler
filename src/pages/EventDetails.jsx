import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import { AccessTime, LocationOn, ArrowBack } from "@mui/icons-material";
import { API_URL } from "../config";
import LocationMap from "../components/LocationMap";
import { geocodeAddress } from "../services/geocodingService";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [coords, setCoords] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/events/${id}`);
        if (!res.ok) throw new Error("failed to fetch");
        const data = await res.json();
        setEvent(data);
        // Geocode location for map
        if (data.location) {
          setGeocoding(true);
          const result = await geocodeAddress(data.location);
          if (result) {
            setCoords({ lat: result.lat, lng: result.lng });
          }
          setGeocoding(false);
        }
      } catch (err) {
        setError(err.userMessage || "Failed to load event details");
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64 mt-10">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !event) {
    return (
      <div>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} className="mb-4">
          Back to Events
        </Button>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} className="mb-4">
          Back to Events
        </Button>
        <Alert severity="warning">Event not found</Alert>
      </div>
    );
  }

  return (
    <Box className="max-w-5xl mx-auto mt-15">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} className="mb-4">
        Back to Events
      </Button>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" component="h1" className="mb-4 font-bold">
            {event.title}
          </Typography>

          <Box className="space-y-4 mb-6">
            <Box className="flex items-center gap-2 text-gray-600">
              <AccessTime color="action" />
              <Typography variant="body1">
                {new Date(event.date).toLocaleString("de-DE")}
              </Typography>
            </Box>

            <Divider className="my-4" />

            <Typography variant="body1" className="mb-4">
              {event.description || "No description provided."}
            </Typography>

            <Divider className="my-4" />

            {event.location && (
              <Box className="flex items-center gap-2 text-gray-600">
                <LocationOn color="action" />
                <Typography variant="body1">{event.location}</Typography>
              </Box>
            )}
          </Box>

          <Box className="space-y-4 mb-6">
            {coords ? (
              <LocationMap
                lat={coords.lat}
                lng={coords.lng}
                name={event.location || event.title}
                height="300px"
              />
            ) : geocoding ? (
              <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-lg">
                <CircularProgress size={30} />
                <p className="text-sm text-gray-500 ml-2">Loading map...</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">📍 No location data</p>
              </div>
            )}

            {coords && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LocationOn />}
                onClick={() => {
                  const url = `https://www.openstreetmap.org/directions?from=&to=${coords.lat}%2C${coords.lng}`;
                  window.open(url, "_blank");
                }}
                className="bg-primary text-white justify-center"
              >
                Get Directions
              </Button>
            )}
          </Box>

          <Divider className="my-4" />

          {error && (
            <Alert severity="error" className="mt-4">
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventDetails;
