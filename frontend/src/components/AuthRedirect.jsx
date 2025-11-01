import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext();

export default function AuthRedirect() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) {
      return;
    }

    if (!auth.user) {
      navigate("/login", { replace: true });
      return;
    }

    // Redirect based on company plan status
    if (auth.company && auth.company.plan) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/company-info", { replace: true });
    }
  }, [auth, navigate]);

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  return null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    company: null,
    loading: true,
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/company/verify-company");
        setAuth({
          user: res.data.user || null,
          company: res.data.company || null,
          loading: false,
        });
      } catch (err) {
        // Handle unauthenticated or missing company
        setAuth({ user: null, company: null, loading: false });
      }
    };

    fetchCompany();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
