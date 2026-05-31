import { Providers } from "./Providers"; // לייבא את הקובץ שיצרנו בשלב 1
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {/* עטיפת כל עמודי האתר בתוך רדאקס ומערכת הטוסטים */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}