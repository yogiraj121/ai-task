import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Step1 = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Save company information
      const response = await api.post("/company/create", {
        name: data.companyName,
        domain: data.domain,
        size: data.companySize,
      });

      if (response.data.success) {
        // Update auth context with the new company
        updateCompany(response.data.company);
        
        // Navigate to plan selection
        navigate("/onboarding/plan");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save company information"
      );
      console.error("Error saving company info:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-gray-700"
          >
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register("companyName", {
              required: "Company name is required",
            })}
          />
          {errors.companyName && (
            <span className="text-sm text-red-500">
              {errors.companyName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="domain" className="text-sm font-medium text-gray-700">
            Domain
          </label>
          <input
            id="domain"
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register("domain", { required: "Domain is required" })}
          />
          {errors.domain && (
            <span className="text-sm text-red-500">
              {errors.domain.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="companySize"
            className="text-sm font-medium text-gray-700"
          >
            Company Size
          </label>
          <select
            id="companySize"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register("companySize", {
              required: "Company size is required",
            })}
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
          {errors.companySize && (
            <span className="text-sm text-red-500">
              {errors.companySize.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Next"}
        </button>
        {error && (
          <div className="text-red-500 text-center mt-2 text-sm">{error}</div>
        )}
      </form>
    </div>
  );
};

export default Step1;
