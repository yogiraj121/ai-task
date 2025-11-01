import { useState, React } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock registration - in a real app, this would be an API call
      console.log('Registration attempt with:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: formData.fullname,
        company: formData.company,
        role: 'user'
      };
      
      console.log('Mock registration successful:', mockUser);
      
      // Show success message
      toast.success('Registration successful! Redirecting to login...');
      
      // Clear form
      reset();
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            email: formData.email,
            message: 'Registration successful! Please log in.' 
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex h-screen">
      <div className="w-1/2">
        <img
          src="/your-image-path.jpg"
          alt="Register"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white border-l">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-8 w-2/3 bg-white "
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create an Account
          </h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="fullname"
              className="text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              {...register("fullname", { required: "Full name is required" })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.fullname && (
              <span className="text-red-500 text-sm">
                {errors.fullname.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="company"
              className="text-sm font-medium text-gray-700"
            >
              Company
            </label>
            <input
              id="company"
              type="text"
              {...register("company", { required: "Company is required" })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.company && (
              <span className="text-red-500 text-sm">
                {errors.company.message}
              </span>
            )}
          </div>

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
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
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
            {loading ? "Registering..." : "Create Account"}
          </button>

          <div className="flex justify-between items-center mt-4 text-sm">
            <span className="text-gray-600">
              Already have an account?
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
              >
                Login
              </a>
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

export default Register;
