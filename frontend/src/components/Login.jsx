import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showLoading, showSuccess, showError, dismissToast } from "../utils/toast";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (formData) => {
    const toastId = showLoading('Signing in...');
    setLoading(true);
    setError(null);
    
    try {
      // Use mock login with provided credentials or defaults
      const email = formData.email || 'test@example.com';
      const password = formData.password || 'password';
      
      console.log('Attempting login with:', { email });
      const response = await login(email, password);
      
      if (response?.success) {
        console.log('Login successful, user:', response.user);
        dismissToast(toastId);
        showSuccess('Login successful! Redirecting...');
        reset();
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        const errorMsg = response?.message || 'Login failed. Please try again.';
        console.error('Login error:', errorMsg);
        showError(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || "An unexpected error occurred. Please try again.";
      showError(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
      setTimeout(() => dismissToast(), 5000); // Ensure all toasts are cleared after 5 seconds
    }
  };

  return (
    <div className="bg-white flex h-screen">
      <div className="w-1/2">
        <img
          src="/your-image-path.jpg"
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white border-l">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-8 w-2/3 bg-white"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login
          </h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Password is required" })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-gray-600">
              Don't have an account?
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
              >
                Sign Up
              </Link>
            </span>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot Password?
            </a>
          </div>
          {error ? (
            <div className="text-red-500 text-center mt-4">{error}</div>
          ) : (
            <div>....</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
