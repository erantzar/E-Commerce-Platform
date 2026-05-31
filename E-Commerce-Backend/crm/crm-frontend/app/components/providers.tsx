// app/providers.tsx
"use client"; // ◄ חובה! זה אומר ל-Next.js שהרכיב הזה ירוץ בצד הלקוח

import { Provider } from "react-redux";
import { store } from "../store";
export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}