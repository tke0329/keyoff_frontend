"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Track } from "@/lib/types";
import { safeUrl } from "@/lib/urls";
import { spotifyTrackId, spotifyTrackUrl } from "@/lib/spotify";
import { save } from "@/lib/manage-api";
import SpotifyEmbed from "./spotify-embed";

export default function PlaylistEditor({ tracks }: { tracks: Track[] }) {
  const router = useRouter();
  const removing = useRef(false);
  const [trackState, setTrackState] = useState({ source: tracks, items: tracks });
  const items = trackState.source === tracks ? trackState.items : tracks;
  const [adding, setAdding] = useState(!tracks.length);
  const [editing, setEditing] = useState<Track | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const maximum = items.reduce((value, item) => Math.max(value, item.displayOrder ?? -1), -1);
  const nextOrder = items.some(item => item.displayOrder === null) || maximum === 2147483647 ? null : maximum + 1;
  function saved(track: Track) {
    setTrackState({ source: tracks, items: editing ? items.map(item => item.id === track.id ? track : item) : [...items, track] });
    setAdding(false); setEditing(null);
    setMessage("음악을 저장했습니다. 공개 프로필과 Catalog에 반영됩니다.");
    router.refresh();
  }
  async function removeTrack(track: Track) {
    if (removing.current) return;
    removing.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      await save(`playlist/me/${track.id}`, "DELETE");
      setTrackState({ source: tracks, items: items.filter(item => item.id !== track.id) });
      setConfirmId(null);
      setMessage("곡을 삭제했습니다. 이전에 업로드한 파일이 연결되어 있었다면 파일은 보관됩니다.");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "곡을 삭제하지 못했습니다."); }
    finally { removing.current = false; setBusy(false); }
  }
  const formOpen = adding || editing !== null;
  return <section className="playlist-workspace">
    <div className="editor-section-heading">
      <div><p className="eyebrow">YOUR MUSIC LIBRARY</p><h2>나의 플레이리스트</h2><p>Spotify 개별 곡 링크를 등록해 공개 프로필과 Catalog에 소개하세요.</p></div>
      <button type="button" className="button" disabled={busy || formOpen} onClick={() => { setAdding(true); setEditing(null); setMessage(""); setError(""); setConfirmId(null); }}>+ 곡 추가</button>
    </div>
    {message && <p role="status" className="save-feedback">{message}</p>}
    {error && <p role="alert" className="error-text">{error}</p>}
    {formOpen && <TrackForm key={editing?.id || "new"} item={editing || undefined} nextOrder={nextOrder} onSaved={saved} onCancel={() => { setAdding(false); setEditing(null); }} />}
    <div className="career-list-tools"><span>{items.length}개의 음악</span></div>
    {items.length ? <ul className="playlist-management-list">
      {items.map((track, index) => <li key={track.id} className={`playlist-management-row ${editing?.id === track.id ? "is-editing" : ""}`}>
        <span className="track-number">{String(index + 1).padStart(2, "0")}</span>
        <div className="playlist-track-info"><h3>{track.spotifyAlbumId ? "이전 앨범 · " : ""}{track.title}</h3>{track.creditedArtist && <p className="playlist-credit">{track.creditedArtist}</p>}{track.spotifyTrackId ? previewId === track.id ? <><SpotifyEmbed trackId={track.spotifyTrackId} title={track.title} /><button type="button" className="text-link playlist-preview-toggle" onClick={() => setPreviewId(null)}>미리듣기 닫기</button></> : <button type="button" className="text-link playlist-preview-toggle" onClick={() => setPreviewId(track.id)}>Spotify 미리듣기</button> : track.spotifyAlbumId ? <p className="field-hint">앨범 등록은 종료되었습니다. 공개 목록에는 표시되지 않습니다. 개별 곡 링크로 바꾸거나 삭제해 주세요.</p> : safeUrl(track.audioUrl) ? <><p className="field-hint">이전에 업로드한 곡입니다. Spotify 링크로 전환할 수 있습니다.</p><audio controls preload="none" src={safeUrl(track.audioUrl)} aria-label={`${track.title} 미리듣기`} /></> : <p className="field-hint">이전 음원 파일을 찾을 수 없습니다. Spotify 링크로 전환해 주세요.</p>}</div>
        <div className="career-row-actions">
          <button type="button" className="career-edit-button" disabled={busy || formOpen} aria-label={`${track.title} 곡 수정`} onClick={() => { setEditing(track); setAdding(false); setConfirmId(null); setMessage(""); setError(""); }}>수정</button>
          <button type="button" className="career-edit-button delete-link" disabled={busy || formOpen} aria-label={`${track.title} 곡 삭제`} onClick={() => setConfirmId(confirmId === track.id ? null : track.id)}>삭제</button>
        </div>
        {confirmId === track.id && <div className="delete-confirm career-row-confirm"><p>‘{track.title}’ 곡을 공개 프로필과 Catalog에서 삭제하시겠습니까? 이전에 업로드한 파일이 연결되어 있었다면 파일은 보관됩니다.</p><button type="button" disabled={busy} onClick={() => void removeTrack(track)}>곡 삭제 확인</button><button type="button" disabled={busy} onClick={() => setConfirmId(null)}>취소</button></div>}
      </li>)}
    </ul> : <p className="empty">아직 등록된 곡이 없습니다. Spotify 링크로 첫 곡을 추가하세요.</p>}
  </section>;
}

function TrackForm({ item, nextOrder, onSaved, onCancel }: {
  item?: Track;
  nextOrder: number | null;
  onSaved: (track: Track) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [creditedArtist, setCreditedArtist] = useState(item?.creditedArtist || "");
  const lastAutoTitle = useRef("");
  const [spotifyUrl, setSpotifyUrl] = useState(spotifyTrackUrl(item?.spotifyTrackId));
  const [metadataStatus, setMetadataStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const spotifyId = spotifyTrackId(spotifyUrl);
  useEffect(() => {
    if (!spotifyId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setMetadataStatus("Spotify에서 제목을 확인하는 중…");
      try {
        const response = await fetch(`/api/spotify/metadata?url=${encodeURIComponent(spotifyTrackUrl(spotifyId))}`, { signal: controller.signal });
        const result: { title?: string; message?: string } = await response.json();
        if (!response.ok || !result.title) throw new Error(result.message || "제목을 확인하지 못했습니다.");
        const previousAutoTitle = lastAutoTitle.current;
        setTitle(current => !current.trim() || current === previousAutoTitle ? result.title! : current);
        lastAutoTitle.current = result.title;
        setMetadataStatus("제목을 가져왔습니다. 아티스트명은 직접 입력해 주세요.");
      } catch (error) {
        if (!controller.signal.aborted) setMetadataStatus(error instanceof Error ? error.message : "곡 정보를 확인하지 못했습니다.");
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [spotifyId]);
  useEffect(() => {
    if (!item?.id) return;
    form.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus({ preventScroll: true });
    form.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, [item?.id]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!spotifyId) { setError("Spotify 곡 공유 링크를 확인해 주세요."); return; }
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const result = await save(`playlist/me${item ? `/${item.id}` : ""}`, item ? "PUT" : "POST", {
        title,
        spotifyUrl,
        creditedArtist: creditedArtist.trim() || null,
        displayOrder: item ? item.displayOrder : nextOrder,
      });
      onSaved(result.data);
    } catch (error) { setError(error instanceof Error ? error.message : "곡을 저장하지 못했습니다."); submitting.current = false; setBusy(false); }
  }
  return <form ref={form} className="form-card track-register" onSubmit={submit}>
    <div className="career-form-heading"><h3>{item ? "곡 수정" : "새 곡 등록"}</h3><span>* 필수 입력</span></div>
    <fieldset disabled={busy}>
      <legend className="visually-hidden">곡 정보</legend>
      <label>곡 제목 <span className="required-mark">*</span><input name="title" required maxLength={255} value={title} onChange={event => setTitle(event.target.value)} placeholder="곡 또는 작품 이름" /></label>
      <label>가수·참여 아티스트 <span className="required-mark">*</span><input name="creditedArtist" required maxLength={255} value={creditedArtist} onChange={event => setCreditedArtist(event.target.value)} placeholder="Spotify에 표시된 아티스트 이름" /></label>
    </fieldset>
    {item?.spotifyAlbumId && <p className="form-note">이전 앨범 항목입니다. 개별 곡의 제목과 Spotify 곡 링크로 바꾸면 다시 공개됩니다.</p>}
    {item && !item.spotifyTrackId && !item.spotifyAlbumId && <p className="form-note">이 음악은 이전 업로드 방식으로 등록되었습니다. 수정하면 Spotify 링크로 전환됩니다.</p>}
    <label>Spotify 곡 공유 링크 <span className="required-mark">*</span>
      <input type="url" required maxLength={255} value={spotifyUrl} disabled={busy} onChange={event => { setSpotifyUrl(event.target.value); setError(""); }} placeholder="https://open.spotify.com/track/..." />
      <span className="field-hint">Spotify 공유 링크를 붙여넣어 주세요. 제목은 자동 입력되며 수정할 수 있습니다.</span>
      {metadataStatus && spotifyId && <span className="field-hint" role="status">{metadataStatus}</span>}
    </label>
    {spotifyId && <div className="selected-audio"><SpotifyEmbed trackId={spotifyId} title={title || "선택한 곡"} /><span className="field-hint">Spotify 플레이어에서 확인한 뒤 저장해 주세요.</span></div>}
    <div className="career-form-actions"><p className="form-note">Spotify에서 재생이 허용된 곡만 표시됩니다. 본인 작품의 링크를 등록해 주세요.</p><div>
      <button type="button" className="text-link" disabled={busy} onClick={onCancel}>취소</button>
      <button className="button" disabled={busy || !spotifyId}>{busy ? "저장 중…" : item ? "변경 저장" : "곡 등록"}</button>
    </div></div>
    {error && <p role="alert" className="error-text">{error}</p>}
  </form>;
}
