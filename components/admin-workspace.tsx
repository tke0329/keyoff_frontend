"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtistAccount } from "@/lib/types";
import ArtistPartField from "./artist-part-field";
async function manage(path: string, method: string, data: unknown) {
  const response = await fetch(`/api/admin/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "로그인이 만료되었습니다. /login에서 다시 로그인해 주세요."
        : result.message,
    );
}
export default function AdminWorkspace({
  accounts,
}: {
  accounts: ArtistAccount[];
}) {
  return (
    <div className="admin-grid">
      <CreateArtist />
      <section className="admin-accounts">
        <h2>Artist Accounts</h2>
        <p className="muted">
          순서는 작은 숫자부터 표시됩니다. 같은 숫자는 페이지 주소 순으로
          정렬됩니다.
        </p>
        {accounts.length ? (
          accounts.map((account) => (
            <ArtistAccountCard key={account.id} account={account} />
          ))
        ) : (
          <p className="empty">
            등록된 아티스트 계정이 없습니다. 새 계정을 생성해 주세요.
          </p>
        )}
      </section>
    </div>
  );
}
function CreateArtist() {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const artistPart = formData.getAll("artistPart");
    if (!artistPart.length) {
      setMessage("활동 역할을 하나 이상 선택해 주세요.");
      return;
    }
    if (submitting.current) return;
    submitting.current = true;
    const data = { ...Object.fromEntries(formData), artistPart };
    setBusy(true);
    setMessage("");
    try {
      await manage("accounts", "POST", data);
      form.reset();
      setMessage("아티스트 계정을 생성했습니다.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "생성하지 못했습니다.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="form-card" onSubmit={submit}>
      <p className="eyebrow">CREATE ARTIST</p>
      <h2>New Artist</h2>
      <label>
        로그인 아이디
        <input
          name="username"
          required
          minLength={3}
          maxLength={50}
          pattern="[A-Za-z0-9_-]+"
          autoComplete="off"
        />
      </label>
      <label>
        초기 비밀번호
        <input
          type="password"
          name="password"
          required
          minLength={8}
          maxLength={64}
          autoComplete="new-password"
        />
      </label>
      <label>
        아티스트 이름
        <input name="artistName" required maxLength={255} />
      </label>
      <ArtistPartField />
      <label>
        페이지 주소 (Slug)
        <input
          name="slug"
          required
          maxLength={255}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          autoComplete="off"
          placeholder="영문 소문자·숫자·하이픈"
        />
      </label>
      <p className="form-note">
        /artists/페이지주소로 공개 프로필이 생성됩니다. 초기 노출 순서는
        0입니다.
      </p>
      <button className="button" disabled={busy}>
        {busy ? "생성 중…" : "아티스트 계정 생성"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
function ArtistAccountCard({ account }: { account: ArtistAccount }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  async function update(action: string, data: unknown, success: string) {
    if (submitting.current) return false;
    submitting.current = true;
    setBusy(true);
    setMessage("");
    try {
      await manage(`accounts/${account.id}/${action}`, "PATCH", data);
      setMessage(success);
      router.refresh();
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "변경하지 못했습니다.",
      );
      return false;
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  async function order(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await update(
      "order",
      { displayOrder: Number(form.get("displayOrder")) },
      "노출 순서를 저장했습니다.",
    );
  }
  async function password(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = new FormData(form).get("password");
    if (
      await update(
        "password",
        { password: value },
        "비밀번호를 변경했습니다. 기존 로그인은 만료됩니다.",
      )
    ) {
      form.reset();
      setPasswordOpen(false);
    }
  }
  async function status() {
    await update(
      "status",
      { status: account.status === "ACTIVE" ? "DISABLED" : "ACTIVE" },
      account.status === "ACTIVE"
        ? "계정을 비활성화했습니다."
        : "계정을 활성화했습니다.",
    );
    setConfirmStatus(false);
  }
  return (
    <article className="form-card admin-account">
      <div className="account-heading">
        <div>
          <h3>{account.artistName || account.username}</h3>
          <p className="muted">ID: {account.username}</p>
        </div>
        <span
          className={`account-status ${account.status === "ACTIVE" ? "active" : ""}`}
        >
          {account.status === "ACTIVE" ? "활성" : "비활성"}
        </span>
      </div>
      {account.slug && (
        <Link
          className="text-link"
          href={`/artists/${encodeURIComponent(account.slug)}`}
        >
          /artists/{account.slug} ↗
        </Link>
      )}
      <form className="order-form" onSubmit={order}>
        <label>
          노출 순서
          <input
            key={account.displayOrder}
            type="number"
            name="displayOrder"
            min={0}
            max={2147483647}
            step={1}
            required
            defaultValue={account.displayOrder ?? 0}
          />
        </label>
        <button className="button" disabled={busy || !account.artistId}>
          순서 저장
        </button>
      </form>
      <div className="account-actions">
        <button
          className="text-link"
          disabled={busy}
          onClick={() => setPasswordOpen(!passwordOpen)}
        >
          비밀번호 변경
        </button>
        <button
          className="text-link"
          disabled={busy}
          onClick={() => setConfirmStatus(!confirmStatus)}
        >
          {account.status === "ACTIVE" ? "계정 비활성화" : "계정 활성화"}
        </button>
      </div>
      {passwordOpen && (
        <form className="password-form" onSubmit={password}>
          <label>
            새 비밀번호
            <input
              type="password"
              name="password"
              required
              minLength={8}
              maxLength={64}
              autoComplete="new-password"
            />
          </label>
          <p className="form-note">
            변경하면 이 계정의 기존 로그인이 만료됩니다.
          </p>
          <button className="button" disabled={busy}>
            비밀번호 저장
          </button>
        </form>
      )}
      {confirmStatus && (
        <div className="delete-confirm">
          <p>
            이 계정을 {account.status === "ACTIVE" ? "비활성화" : "활성화"}
            하시겠습니까?
          </p>
          <button disabled={busy} onClick={status}>
            변경 확인
          </button>
          <button disabled={busy} onClick={() => setConfirmStatus(false)}>
            취소
          </button>
        </div>
      )}
      <p role="status">{message}</p>
    </article>
  );
}
