"use client";
import { useRef, useState } from "react";
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  async function logout() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      window.location.replace("/");
    } catch {
      setMessage("로그아웃하지 못했습니다.");
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="text-link" onClick={logout} disabled={busy}>
        {busy ? "처리 중…" : "로그아웃"}
      </button>
      {message && (
        <p role="alert" className="error-text">
          {message}
        </p>
      )}
    </div>
  );
}
