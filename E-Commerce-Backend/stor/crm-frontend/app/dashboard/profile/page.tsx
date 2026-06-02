// app/dashboard/profile/page.tsx
import OrdersTable from "@/features/orders/OrdersTable";
import UserProfile from "@/features/profile/page";

export default function ProfilePage() {
  return (
    <main style={{ padding: "20px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <UserProfile />
      <OrdersTable />   {/* ← זה "שלב 2ב" — רק להוסיף את הרכיב */}

    </main>
  );
}