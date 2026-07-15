import { Suspense } from "react";
import { LoginFallback } from "@/components/loading/login-fallback";
import AdminLoginForm from "./login-form";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
