"use client";
import { useRef, useState } from "react";
export default function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.role) throw new Error(result?.message || `로그인하지 못했습니다. (${response.status})`);
      window.location.replace(
        result.role === "ADMIN"
          ? "/admin"
          : result.slug
            ? `/artists/${encodeURIComponent(result.slug)}`
            : "/profile/edit",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "로그인하지 못했습니다.",
      );
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <p className="eyebrow">WELCOME BACK</p>
      <h2>Login</h2>
      <label>
        아이디
        <input
          name="username"
          required
          autoComplete="username"
          maxLength={50}
        />
      </label>
      <label>
        비밀번호
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          maxLength={64}
        />
      </label>
      {message && (
        <p role="alert" className="error-text">
          {message}
        </p>
      )}
      <button className="button" disabled={busy}>
        {busy ? "확인 중…" : "로그인 →"}
      </button>
      <p className="form-note">
        등록된 관리자 또는 아티스트 계정으로 로그인해 주세요.
      </p>
    </form>
  );
}
