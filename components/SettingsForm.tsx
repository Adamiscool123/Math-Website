"use client";

import { KeyRound, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ThemeCustomizer } from "@/components/ThemeCustomizer";

type User = {
  id: string;
  name: string;
  email: string;
};

type Message = {
  type: "error" | "success";
  text: string;
};

export function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage(null);
    setProfilePending(true);

    try {
      const response = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage({ type: "error", text: data.error ?? "Could not update username." });
        return;
      }

      window.dispatchEvent(new CustomEvent("matheye:user-updated", { detail: { user: data.user } }));
      setProfileMessage({ type: "success", text: "Username updated." });
      router.refresh();
    } catch {
      setProfileMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setProfilePending(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage(null);

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordPending(true);
    try {
      const response = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage({ type: "error", text: data.error ?? "Could not update password." });
        return;
      }

      event.currentTarget.reset();
      setPasswordMessage({ type: "success", text: "Password updated." });
    } catch {
      setPasswordMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <>
      <ThemeCustomizer />
      <div className="settings-grid">
        <form className="panel" onSubmit={saveProfile}>
          <span className="eyebrow">Profile</span>
          <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>Username</h1>
          <p>Choose the name shown in your sidebar profile.</p>
          {profileMessage ? <Alert message={profileMessage} /> : null}
          <div className="field">
            <label htmlFor="name">Username</label>
            <input id="name" maxLength={100} name="name" onChange={(event) => setName(event.target.value)} required value={name} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input disabled id="email" value={user.email} />
          </div>
          <button className="btn btn-primary" disabled={profilePending} type="submit">
            <Save size={16} />
            {profilePending ? "Saving..." : "Save username"}
          </button>
        </form>

        <form className="panel" onSubmit={savePassword}>
          <span className="eyebrow">Security</span>
          <h2 style={{ fontSize: "2rem", marginBottom: 8 }}>Password</h2>
          <p>Use your current password before setting a new one.</p>
          {passwordMessage ? <Alert message={passwordMessage} /> : null}
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input autoComplete="current-password" id="currentPassword" name="currentPassword" required type="password" />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input autoComplete="new-password" id="newPassword" minLength={6} name="newPassword" required type="password" />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input autoComplete="new-password" id="confirmPassword" minLength={6} name="confirmPassword" required type="password" />
          </div>
          <button className="btn btn-primary" disabled={passwordPending} type="submit">
            <KeyRound size={16} />
            {passwordPending ? "Saving..." : "Change password"}
          </button>
        </form>
      </div>
    </>
  );
}

function Alert({ message }: { message: Message }) {
  return <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}>{message.text}</div>;
}
