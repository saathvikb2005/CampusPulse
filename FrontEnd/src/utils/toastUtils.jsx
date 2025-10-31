// src/utils/toastUtils.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import Toast from '../components/Toast';

let toastContainer = null;
let toastId = 0;
const activeToasts = new Map();

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '0';
    toastContainer.style.right = '0';
    toastContainer.style.zIndex = '1000';
    toastContainer.style.pointerEvents = 'none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

export const showToast = (message, type = 'info', duration = 3000) => {
  const container = getToastContainer();
  const toastElement = document.createElement('div');
  toastElement.style.pointerEvents = 'auto';
  
  const currentToastId = ++toastId;
  
  const removeToast = () => {
    if (toastElement && toastElement.parentNode) {
      const root = activeToasts.get(currentToastId);
      if (root) {
        root.unmount();
        activeToasts.delete(currentToastId);
      }
      toastElement.parentNode.removeChild(toastElement);
    }
  };

  container.appendChild(toastElement);

  // Create root and render toast
  const root = createRoot(toastElement);
  activeToasts.set(currentToastId, root);
  
  root.render(
    <Toast 
      message={message} 
      type={type} 
      duration={duration}
      onClose={removeToast}
    />
  );

  return currentToastId;
};

// Convenience methods
export const showSuccessToast = (message, duration) => showToast(message, 'success', duration);
export const showErrorToast = (message, duration) => showToast(message, 'error', duration);
export const showWarningToast = (message, duration) => showToast(message, 'warning', duration);
export const showInfoToast = (message, duration) => showToast(message, 'info', duration);