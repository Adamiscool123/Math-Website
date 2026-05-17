import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <main className="form-shell">
      <Suspense fallback={<div className="panel">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
