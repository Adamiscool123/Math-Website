import Link from "next/link";
import { SettingsForm } from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="container section">
        <div className="panel narrow-panel">
          <span className="eyebrow">Settings</span>
          <h1 style={{ fontSize: "2.4rem" }}>Sign in to manage your account</h1>
          <p>Username and password settings are available after you log in.</p>
          <Link className="btn btn-primary" href="/auth">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="course-header compact-header">
        <div>
          <span className="eyebrow">Settings</span>
          <h1 style={{ fontSize: "clamp(2.3rem, 6vw, 4rem)" }}>Account</h1>
          <p>Update your username, password, colors, and font.</p>
        </div>
      </div>
      <SettingsForm user={user} />
    </main>
  );
}
