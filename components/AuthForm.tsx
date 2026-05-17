"use client";

import { LogIn, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  const buttonLabel = useMemo(() => {
    if (pending) return mode === "signup" ? "Creating account..." : "Logging in...";
    return mode === "signup" ? "Create account" : "Log in";
  }, [mode, pending]);

  function chooseMode(nextMode: Mode) {
    setError("");
    setSuccess("");
    router.replace(nextMode === "signup" ? "/auth?mode=signup" : "/auth", { scroll: false });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(mode === "signup" ? "Account created." : "Logged in.");
      window.dispatchEvent(new CustomEvent("matheye:user-updated", { detail: { user: data.user } }));
      router.push("/courses");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="form-card panel">
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => chooseMode("login")} type="button">
          Log in
        </button>
        <button className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => chooseMode("signup")} type="button">
          Sign up
        </button>
      </div>

      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p>{mode === "signup" ? "Save progress, practice history, and test results." : "Continue your Algebra 1 course."}</p>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <form onSubmit={submit}>
        {mode === "signup" ? (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" autoComplete="name" required />
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6} required />
        </div>
        <button className="btn btn-primary" disabled={pending} style={{ width: "100%" }} type="submit">
          {mode === "signup" ? <UserPlus size={16} /> : <LogIn size={16} />}
          {buttonLabel}
        </button>
      </form>
    </div>
  );
}
