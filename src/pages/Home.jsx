import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Alert, CircularProgress, Chip, Box } from "@mui/material";
import { AccessTime, LocationOn } from "@mui/icons-material";
import { API_URL } from "../config";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/events`);
        if (!res.ok) throw new Error("failed to fetch");
        const data = await res.json();
        const sortedEvents = data.results.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
      } catch (err) {
        setError(err.userMessage || "Failed to load events");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4 mt-10 justify-center">
        {error}
      </Alert>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto mt-15">
      <Typography variant="h4" component="h1" className="mb-6 mt-10 font-bold">
        Upcoming Events
      </Typography>

      {events.length === 0 ? (
        <Typography variant="body1" color="text.secondary" className="text-center py-12">
          No events scheduled at this time.
        </Typography>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              variant="outlined"
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <CardContent>
                <Typography variant="h6" component="h2" className="mb-2 font-semibold">
                  {event.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" className="mb-3 line-clamp-2">
                  {event.description || "No description available"}
                </Typography>

                <Box className="space-y-4">
                  <Box className="flex items-center gap-2 text-sm text-gray-600">
                    <AccessTime color="action" />
                    <Typography variant="body2">
                      {new Date(event.date).toLocaleString("de-DE")}
                    </Typography>
                  </Box>

                  <Box className="flex items-center gap-2 text-sm text-gray-600">
                    <LocationOn color="action" />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Home;
