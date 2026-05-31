import "@/app/globals.css"; 
import { Providers } from "./components/providers"; // ה-Providers של Redux
import Navbar from "@/features/Navbar/Navbar"; // התפריט שיצרת ושמרת בפיצ'רס

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, padding: 0 }}>
        
        {/* 1. עוטפים את הכל ב-Redux כדי שהמידע של העגלה והמשתמש יהיה זמין */}
        <Providers>
          
          {/* 2. שמים את התפריט בראש האתר, הוא חייב להיות בתוך ה-Providers */}
          <Navbar /> 
          
          {/* 3. כאן יוצגו הדפים עצמם של האתר שלך */}
          <main>
            {children}
          </main>

        </Providers>

      </body>
    </html>
  );
}