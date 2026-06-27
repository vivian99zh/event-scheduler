import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

import { useAuth } from "../contexts/AuthProvider";
import { API_URL } from "../config";
import LocationAutocomplete from "../components/LocationAutocomplete";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { getHeaders } = useAuth();
  const formDataInitial = {
    title: "",
    description: "",
    date: "",
    location: "",
  };
  const [formData, setFormData] = useState(formDataInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("failed to fetch");
      setSuccess(true);
      setFormData(formDataInitial);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.userMessage || "Failed to create event");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-xl mx-auto mt-15 space-y-10">
      <Typography variant="h4" component="h1" className="mb-6 mt-10 font-bold">
        Create New Event
      </Typography>

      <Card>
        <CardContent>
          {success && (
            <Alert severity="success" className="mb-4">
              Event created successfully! Redirecting to home...
            </Alert>
          )}

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              className="mb-4"
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              required
              disabled={loading}
              className="mb-4"
            />

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Date and Time"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={loading}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <LocationAutocomplete
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Box>

            <Box className="flex gap-4 my-4">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                className="flex-1 bg-primary"
              >
                {loading ? <CircularProgress size={24} className="text-white" /> : "Create Event"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEvent;
