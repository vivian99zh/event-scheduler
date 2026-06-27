import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { AccessTime, LocationOn, Delete } from "@mui/icons-material";
import { API_URL } from "../config";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthProvider";

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, getHeaders } = useAuth();

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  const handleDeleteClick = (e) => {
    setEventToDelete(e);
    console.log(e.target);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API_URL}/events/${eventToDelete.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete event");
      }

      // Remove event from list
      setEvents(events.filter((e) => e.id !== eventToDelete.id));

      setSnackbar({
        open: true,
        message: `"${eventToDelete.title}" deleted successfully!`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete event",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
                <Typography variant="h6" component="h2" className="my-2 font-semibold">
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

                {isAuthenticated && (
                  <Button
                    size="small"
                    color="error"
                    className="absolute top-1 right-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(event);
                    }}
                    aria-label="Delete event"
                  >
                    <Delete fontSize="small" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
