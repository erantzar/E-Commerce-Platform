"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("התחברת בהצלחה! ברוך הבא.");
      router.push("/"); // או עמוד הבית של החנות
    } else {
      const errorMessage = resultAction.payload as string || "ההתחברות נכשלה. בדוק את הפרטים או אמת את המייל.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            התחברות לחשבון
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">אימייל</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">סיסמה</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </button>
          </div>
          <button onClick={() => { window.location.href = "/"; }} style={{ padding: "8px 16px", background: "#48bb78", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>חזור לדף הבית</button>
          <button onClick={() => { window.location.href = "/register"; }} style={{ padding: "8px 16px", background: "#48bb78", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>הרשמה</button>
          <button onClick={() => { window.location.href = "/forgot-password"; }} style={{ padding: "8px 16px", background: "#48bb78", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>שכחת סיסמה?</button>

        </form>
      </div>
    </div>
  );
}