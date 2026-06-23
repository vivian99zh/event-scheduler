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

const SignIn = () => {
  const navigate = useNavigate();
  const { signin, getHeaders } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("failed to fetch");
      const data = await res.json();
      const { token } = data;

      signin(token);
      navigate("/");
    } catch (err) {
      setError(err.userMessage || "Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-lg mx-auto mt-15">
      <Typography variant="h4" component="h1" className="mb-6 text-center font-bold">
        Sign In
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mb-4"
            />

            <Button
              type="submit"
              variant="contained"
              className="bg-primary"
              fullWidth
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} className="text-white" /> : "Sign In"}
            </Button>

            <Typography variant="body2" className="text-center mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignIn;
