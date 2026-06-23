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

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
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
    <Box className="max-w-2xl mx-auto mt-15">
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

            {event.location && (
              <Box className="flex items-center gap-2 text-gray-600">
                <LocationOn color="action" />
                <Typography variant="body1">{event.location}</Typography>
              </Box>
            )}
          </Box>

          <Divider className="my-4" />

          <Typography variant="body1" className="mb-4">
            {event.description || "No description provided."}
          </Typography>

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
