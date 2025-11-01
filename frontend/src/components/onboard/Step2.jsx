import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Step3 from "./Step3";
import { useState } from "react";
import api from "../../services/api";

const Step2 = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      plan: "free",
    },
  });

  const plans = [
    { id: "free", name: "Free" },
    { id: "pro", name: "Pro" },
    { id: "enterprise", name: "Enterprise" },
  ];

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Save the plan to the company
      const response = await api.post("/company/plan", { plan: data.plan });
      console.log("Plan saved:", response.data);

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save plan");
      console.error("Error saving plan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return <Step3 />;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Plan</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 mb-6">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                type="radio"
                value={plan.id}
                {...register("plan")}
                className="mr-3"
              />
              <span className="text-lg">{plan.name}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default Step2;
