import { createContext, useContext, useState, useEffect } from "react";
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("token") ? true : false,
  );

  const signin = (newToken) => {
    localStorage.setItem("token", newToken);
    setIsAuthenticated(true);
  };

  const signout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  return (
    <AuthContext value={{ isAuthenticated, signin, signout, getHeaders }}>{children}</AuthContext>
  );
};
