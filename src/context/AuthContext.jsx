import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    name: localStorage.getItem("name") || null,
    email: localStorage.getItem("email") || null,
    _id: localStorage.getItem("userId") || null,
  });

  // Debug user state
  useEffect(() => {
    console.log('AuthContext user state:', user);
  }, [user]);

  const login = (token, role, name = null, email = null, userId = null) => {
    console.log('Login called with:', { token, role, name, email, userId });
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (name) {
      localStorage.setItem("name", name);
    }
    if (email) {
      localStorage.setItem("email", email);
    }
    if (userId) {
      localStorage.setItem("userId", userId);
    }
    setUser({ token, role, name, email, _id: userId });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setUser({ token: null, role: null, name: null, email: null, _id: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;

