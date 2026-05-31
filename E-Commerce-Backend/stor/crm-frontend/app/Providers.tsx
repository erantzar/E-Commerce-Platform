"use client"; 

import { Provider } from "react-redux";
import { store } from "@/store"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      {/* הוספנו aria-label כדי לפתור את השגיאה */}
      <ToastContainer position="top-right" autoClose={3000} aria-label="Notification Container" />
    </Provider>
  );
}