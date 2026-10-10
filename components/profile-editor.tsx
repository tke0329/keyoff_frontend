"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Artist, Career, Track } from "@/lib/types";
import { recordTypes } from "@/lib/record-types";
import ImageUpload from "./image-upload";
import CareerList from "./career-list";
import LogoutButton from "./logout-button";
import PlaylistEditor from "./playlist-editor";
import { save } from "@/lib/manage-api";
import ArtistPartField from "./artist-part-field";
export default function ProfileEditor({
  profile,
  history,
  playlist,
}: {
  profile: Artist;
  history: Career[];
  playlist: Track[];
}) {
  const tabs = ["profile", "career", "playlist"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("profile");
  const [visited, setVisited] = useState<Set<(typeof tabs)[number]>>(() => new Set(["profile"]));
  function selectTab(next: (typeof tabs)[number]) {
    setVisited(current => current.has(next) ? current : new Set([...current, next]));
    setTab(next);
  }
  function navigateTab(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[2]
      : tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next);
    document.getElementById(`edit-tab-${next}`)?.focus();
  }
  return (
    <>
      <div className="editor-toolbar">
        <Link
          className="text-link"
          href={
            profile.slug ? `/artists/${encodeURIComponent(profile.slug)}` : "/"
          }
        >
          ← 공개 프로필 보기
        </Link>
        <LogoutButton />
      </div>
      <div className="editor-tabs" role="tablist" aria-label="프로필 편집 메뉴">
        <button
          id="edit-tab-profile"
          role="tab"
          aria-selected={tab === "profile"}
          aria-controls="edit-panel-profile"
          tabIndex={tab === "profile" ? 0 : -1}
          onKeyDown={navigateTab}
          onClick={() => selectTab("profile")}
        >
          01 <span>프로필 · 이미지</span>
        </button>
        <button
          id="edit-tab-career"
          role="tab"
          aria-selected={tab === "career"}
          aria-controls="edit-panel-career"
          tabIndex={tab === "career" ? 0 : -1}
          onKeyDown={navigateTab}
          onClick={() => selectTab("career")}
        >
          02 <span>커리어 · 이력</span>
          <small>{history.length}</small>
        </button>
        <button
          id="edit-tab-playlist"
          role="tab"
          aria-selected={tab === "playlist"}
          aria-controls="edit-panel-playlist"
          tabIndex={tab === "playlist" ? 0 : -1}
          onKeyDown={navigateTab}
          onClick={() => selectTab("playlist")}
        >
          03 <span>플레이리스트</span><small>{playlist.length}</small>
        </button>
      </div>
      <section
        role="tabpanel"
        id="edit-panel-profile"
        aria-labelledby="edit-tab-profile"
        hidden={tab !== "profile"}
      >
        {visited.has("profile") && <ProfileForm profile={profile} />}
      </section>
      <section
        role="tabpanel"
        id="edit-panel-career"
        aria-labelledby="edit-tab-career"
        hidden={tab !== "career"}
      >
        {visited.has("career") && <CareerEditor history={history} />}
      </section>
      <section role="tabpanel" id="edit-panel-playlist" aria-labelledby="edit-tab-playlist" hidden={tab !== "playlist"}>
        {visited.has("playlist") && <PlaylistEditor tracks={playlist} />}
      </section>
    </>
  );
}
function ProfileForm({ profile }: { profile: Artist }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(profile.profileImage || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || submitting.current) return;
    const formData = new FormData(event.currentTarget);
    const artistPart = formData.getAll("artistPart");
    if (!artistPart.length) {
      setMessage("");
      setError("활동 역할을 하나 이상 선택해 주세요.");
      return;
    }
    const data = Object.fromEntries(formData);
    submitting.current = true;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await save(
        "artist/me",
        "PUT",
        {
          ...Object.fromEntries(
            Object.entries({ ...data, profileImage: image }).map(
              ([key, value]) => [key, value || null],
            ),
          ),
          artistPart,
        },
      );
      setMessage("프로필을 저장했습니다.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "저장하지 못했습니다.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="form-card profile-edit-form" onSubmit={submit}>
      <div className="editor-section-heading">
        <div>
          <p className="eyebrow">YOUR PUBLIC PROFILE</p>
          <h2>나를 소개하는 공간</h2>
          <p>사진과 기본 정보를 한 번에 관리하세요.</p>
        </div>
      </div>
      <div className="profile-form-grid">
        <div className="profile-image-field">
          <h3>프로필 이미지</h3>
          <ImageUpload
            value={image}
            onChange={setImage}
            onBusyChange={setUploading}
            disabled={busy}
          />
          <details className="image-address">
            <summary>외부 이미지 주소로 지정</summary>
            <label>
              이미지 주소
              <input
                type="text"
                inputMode="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                maxLength={255}
                placeholder="https://…"
                disabled={busy || uploading}
              />
            </label>
          </details>
        </div>
        <fieldset className="profile-fields" disabled={busy}>
          <legend className="visually-hidden">기본 정보</legend>
          <label>
            아티스트 이름 <span className="required-mark">*</span>
            <input
              name="name"
              defaultValue={profile.name}
              required
              maxLength={255}
              autoComplete="name"
            />
          </label>
          <ArtistPartField selected={profile.artistPart} />
          <label>
            소개
            <textarea
              name="biography"
              defaultValue={profile.biography || ""}
              maxLength={1000}
              rows={6}
              placeholder="작업 방향과 아티스트의 이야기를 들려주세요."
            />
            <span className="field-hint">최대 1,000자</span>
          </label>
          <div className="field-row">
            <label>
              SNS 주소
              <input
                name="snsLink"
                type="url"
                defaultValue={profile.snsLink || ""}
                maxLength={255}
                placeholder="https://…"
              />
            </label>
            <label>
              연락처
              <input
                name="phoneNumber"
                type="tel"
                defaultValue={profile.phoneNumber || ""}
                maxLength={30}
                placeholder="010-0000-0000"
              />
            </label>
          </div>
        </fieldset>
      </div>
      <div className="editor-savebar">
        <p>변경한 정보는 저장 후 공개 프로필에 반영됩니다.</p>
        <button className="button" disabled={busy || uploading}>
          {uploading
            ? "이미지 업로드 중…"
            : busy
              ? "저장 중…"
              : "프로필 저장"}
        </button>
      </div>
      {message && (
        <p role="status" className="save-feedback">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </form>
  );
}
function CareerEditor({ history }: { history: Career[] }) {
  const workspace = useRef<HTMLElement>(null);
  const submitting = useRef(false);
  const router = useRouter();
  const [listState, setListState] = useState({ source: history, items: history });
  const items = listState.source === history ? listState.items : history;
  const maximumOrder = items.reduce((maximum, item) => Math.max(maximum, item.displayOrder ?? -1), -1);
  const newOrder = items.some(item => item.displayOrder === null) || maximumOrder === 2147483647 ? null : maximumOrder + 1;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function reorder(next: Career[]) {
    if (submitting.current) return;
    submitting.current = true;
    const previous = items;
    setPending(true);
    setError("");
    setMessage("");
    setListState({ source: history, items: next });
    try {
      await save("career/me/order", "PUT", { careerIds: next.map(item => item.id) });
      setListState({ source: history, items: next.map((item, index) => ({ ...item, displayOrder: index })) });
      setMessage("이력 순서를 저장했습니다.");
      router.refresh();
    } catch (error) {
      setListState({ source: history, items: previous });
      setError(error instanceof Error ? error.message : "순서를 저장하지 못했습니다.");
      router.refresh();
    } finally { submitting.current = false; setPending(false); }
  }
  async function remove(item: Career) {
    if (submitting.current) return false;
    submitting.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await save(`career/me/${item.id}`, "DELETE");
      setListState({ source: history, items: items.filter(row => row.id !== item.id) });
      if (editing?.id === item.id) setEditing(null);
      setMessage("이력을 삭제했습니다.");
      router.refresh();
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "삭제하지 못했습니다.");
      return false;
    } finally { submitting.current = false; setPending(false); }
  }
  const [adding, setAdding] = useState(!history.length);
  const [editing, setEditing] = useState<Career | null>(null);
  const [message, setMessage] = useState("");
  function finished(message: string) {
    setEditing(null);
    setAdding(false);
    setMessage(message);
  }
  return (
    <section ref={workspace} className="career-workspace">
      <div className="editor-section-heading">
        <div>
          <p className="eyebrow">CAREER & HISTORY</p>
          <h2>한눈에 보는 나의 이력</h2>
          <p>카테고리별로 이력을 모아 보고, 같은 구획 안에서 순서를 변경하세요.</p>
        </div>
        <button
          type="button"
          className="button"
          disabled={pending}
          onClick={() => {
            setAdding(true);
            setEditing(null);
            setMessage("");
          }}
        >
          + 이력 추가
        </button>
      </div>
      {message && (
        <p role="status" className="save-feedback">
          {message}
        </p>
      )}
      {error && <p role="alert" className="error-text">{error}</p>}
      {pending && <p role="status" className="save-feedback">변경 사항을 저장하고 있습니다…</p>}
      {(adding || editing) && (
        <CareerForm
          key={editing?.id || "new"}
          item={editing || undefined}
          newOrder={newOrder}
          onSaved={finished}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
      <CareerList
        items={items}
        disabled={pending}
        onReorder={adding || editing ? undefined : reorder}
        onDelete={adding || editing ? undefined : remove}
        editingId={editing?.id}
        onEdit={(item) => {
          setEditing(item);
          setAdding(false);
          setMessage("");
          requestAnimationFrame(() => {
            const node = workspace.current?.querySelector<HTMLFormElement>(".career-register");
            node?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({ preventScroll: true });
            node?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
          });
        }}
      />
    </section>
  );
}
function CareerForm({
  item,
  newOrder,
  onSaved,
  onCancel,
}: {
  item?: Career;
  newOrder: number | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [start, setStart] = useState(item?.startDate || "");
  const [end, setEnd] = useState(item?.endDate || "");
  const [dateMode, setDateMode] = useState<"RANGE" | "SINGLE">(item?.dateMode || "RANGE");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      await save(
        `career/me${item ? `/${item.id}` : ""}`,
        item ? "PUT" : "POST",
        {
          ...data,
          location: data.location || null,
          endDate: dateMode === "SINGLE" ? null : data.endDate || null,
          dateMode,
          description: data.description || null,
          displayOrder: item ? item.displayOrder : newOrder,
        },
      );
      onSaved(item ? "이력을 저장했습니다." : "새 이력을 등록했습니다.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "저장하지 못했습니다.");
      submitting.current = false;
      setBusy(false);
    }
  }
  async function remove() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await save(`career/me/${item!.id}`, "DELETE");
      onSaved("이력을 삭제했습니다.");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "삭제하지 못했습니다.");
      submitting.current = false;
      setBusy(false);
      setConfirm(false);
    }
  }
  return (
    <form className="form-card career-register" onSubmit={submit}>
      <div className="career-form-heading">
        <h3>{item ? "이력 수정" : "새 이력 등록"}</h3>
        <span>* 필수 입력</span>
      </div>
      <fieldset disabled={busy}>
        <legend className="visually-hidden">이력 정보</legend>
        <div className="career-form-top">
          <label>
            카테고리 <span className="required-mark">*</span>
            <select
              name="recordType"
              defaultValue={item?.recordType || "CAREER"}
              required
            >
              {recordTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            이력 제목 <span className="required-mark">*</span>
            <input
              name="title"
              defaultValue={item?.title}
              required
              maxLength={255}
              placeholder="활동 · 작품 · 수상 · 학력 이름"
            />
          </label>
          <label>
            기관 · 장소
            <input
              name="location"
              defaultValue={item?.location || ""}
              maxLength={255}
              placeholder="소속 기관 또는 활동 장소"
            />
          </label>
        </div>
        <div className="date-mode-field">
          <span>날짜 방식</span>
          <div className="date-mode-options" role="radiogroup" aria-label="날짜 방식">
            <label className={dateMode === "RANGE" ? "is-selected" : ""}>
              <input type="radio" name="dateMode" value="RANGE" checked={dateMode === "RANGE"} onChange={() => setDateMode("RANGE")} />기간
            </label>
            <label className={dateMode === "SINGLE" ? "is-selected" : ""}>
              <input type="radio" name="dateMode" value="SINGLE" checked={dateMode === "SINGLE"} onChange={() => setDateMode("SINGLE")} />단일 날짜
            </label>
          </div>
          <p className="field-hint">발매일 · 수상일처럼 하루에 해당하는 이력은 단일 날짜를 선택하세요.</p>
        </div>
        <div className={`career-form-dates ${dateMode === "SINGLE" ? "is-single-date" : ""}`}>
          <label>
            {dateMode === "SINGLE" ? "날짜" : "시작일"} <span className="required-mark">*</span>
            <input
              type="date"
              name="startDate"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              required
            />
          </label>
          {dateMode === "RANGE" && <label>
            종료일
            <input
              type="date"
              name="endDate"
              value={end}
              onChange={event => setEnd(event.target.value)}
              min={start || undefined}
            />
            <span className="field-hint">진행 중이면 비워두세요.</span>
          </label>}

        </div>
        <label>
          설명
          <textarea
            name="description"
            defaultValue={item?.description || ""}
            maxLength={255}
            rows={2}
            placeholder="역할, 성과 또는 참고할 내용을 간단히 적어주세요."
          />
        </label>
      </fieldset>
      <div className="career-form-actions">
        <div>
          {item && (
            <button
              type="button"
              className="text-link delete-link"
              disabled={busy}
              onClick={() => setConfirm(!confirm)}
            >
              이력 삭제
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            className="text-link"
            disabled={busy}
            onClick={onCancel}
          >
            취소
          </button>
          <button className="button" disabled={busy}>
            {busy ? "처리 중…" : item ? "변경 저장" : "이력 등록"}
          </button>
        </div>
      </div>
      {confirm && (
        <div className="delete-confirm">
          <p>이 이력을 삭제하시겠습니까?</p>
          <button type="button" disabled={busy} onClick={remove}>
            삭제 확인
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm(false)}
          >
            취소
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </form>
  );
}
