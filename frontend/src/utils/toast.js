// src/utils/toast.js
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default toast configuration
const defaultOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

// Show loading toast
export const showLoading = (message) => {
  return toast.loading(message || 'Processing...', {
    ...defaultOptions,
    position: "top-center",
    autoClose: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    isLoading: true,
  });
};

// Show success toast
export const showSuccess = (message, options = {}) => {
  const toastId = options.toastId;
  if (toastId) {
    toast.update(toastId, {
      render: message || 'Operation successful!',
      type: 'success',
      isLoading: false,
      autoClose: 5000,
      ...options
    });
  } else {
    toast.success(message || 'Operation successful!', {
      ...defaultOptions,
      ...options
    });
  }
};

// Show error toast
export const showError = (message, options = {}) => {
  const toastId = options.toastId;
  if (toastId) {
    toast.update(toastId, {
      render: message || 'An error occurred. Please try again.',
      type: 'error',
      isLoading: false,
      autoClose: 5000,
      ...options
    });
  } else {
    toast.error(message || 'An error occurred. Please try again.', {
      ...defaultOptions,
      ...options
    });
  }
};

// Show info toast
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    ...defaultOptions,
    ...options
  });
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Update existing toast
export const updateToast = (toastId, options) => {
  toast.update(toastId, {
    ...defaultOptions,
    ...options
  });
};

// Export the toast instance for direct use if needed
export { toast };

export default {
  showLoading,
  showSuccess,
  showError,
  showInfo,
  dismissToast,
  dismissAllToasts,
  updateToast,
  toast
};