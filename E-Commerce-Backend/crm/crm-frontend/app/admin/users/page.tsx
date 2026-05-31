// app/admin/users/page.tsx
import UsersManagement from "@/features/admin/UsersManagement";

export default function AdminUsersPage() {
  return (
    <main style={{ padding: "40px 20px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <UsersManagement />
    </main>
  );
}