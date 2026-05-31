// app/dashboard/profile/page.tsx
import UserProfile from "@/features/profile/UserProfile";

export default function ProfilePage() {
  return (
    <main style={{ padding: "20px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <UserProfile />
    </main>
  );
}