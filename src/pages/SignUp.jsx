import { useState } from "react";
import { useNavigate, Link } from "react-router";
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

const SignUp = () => {
  const navigate = useNavigate();
  const { getHeaders } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("failed to fetch");

      setSuccess(true);
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      setError(err.userMessage || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-lg mx-auto mt-15">
      <Typography variant="h4" component="h1" className="mb-6 text-center font-bold">
        Create Account
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {success && (
            <Alert severity="success" className="mb-4">
              Account created successfully! Redirecting to sign in...
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="mb-4"
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="mb-4"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              helperText="Must be at least 6 characters"
              className="mb-4"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="mb-4"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
              className="bg-primary"
            >
              {loading ? <CircularProgress size={24} className="text-white" /> : "Create Account"}
            </Button>

            <Typography variant="body2" className="text-center mt-4">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline">
                Sign In
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignUp;
