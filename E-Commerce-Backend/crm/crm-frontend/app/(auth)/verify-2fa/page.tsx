"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminVerifyCode } from "@/features/auth/authSlice";
import { AppDispatch, RootState } from "@/app/store";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

export default function Verify2FAPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // משיכה אוטומטית של ה-userId מתוך הכתובת למעלה
  const userIdFromUrl = searchParams.get("userId") || "";

  const [userId, setUserId] = useState(userIdFromUrl);
  const [code, setCode] = useState("");

  // עדכון הסטייט במידה וה-URL נטען לאט
  useEffect(() => {
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("מזהה משתמש חסר, אנא חזור לעמוד הלוגין ונסה שוב.");
      return;
    }

    const resultAction = await dispatch(adminVerifyCode({ userId, code }));

    if (adminVerifyCode.fulfilled.match(resultAction)) {
      toast.success("אימות מנהל הצליח! ברוך הבא ל-CRM.");
      router.push("/admin/dashboard"); // הראוט לדאשבורד שלך
    } else {
      const errorMessage = (resultAction.payload as string) || "קוד האימות שגוי או פג תוקף.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            אבטחת מנהל (2FA)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            הזיני את קוד האבטחה שנשלח אלייך למייל כדי להתחבר.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifySubmit}>
          {/* מציג את ה-Input של ה-userId רק אם הוא לא נמצא אוטומטית בכתובת */}
          {!userIdFromUrl && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">מזהה משתמש (userId):</label>
              <input
                type="text"
                required
                className="relative block w-full rounded-md border py-2 px-3 text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-600 mb-4"
                placeholder="הדביקי כאן את ה-userId מהשרת"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1 text-center">קוד אימות (6 ספרות):</label>
            <input
              type="text"
              required
              maxLength={6}
              className="relative block w-full rounded-md border py-3 text-center text-3xl font-bold tracking-widest text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-600"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {userIdFromUrl && (
            <div className="text-xs text-center text-gray-400 block" dir="ltr">
              User ID: <span className="font-mono bg-gray-100 p-1 rounded">{userId}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-400"
          >
            {isLoading ? "מבצע אימות..." : "אשר קוד והתחבר"}
          </button>
        </form>
      </div>
    </div>
  );
}