"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Track } from "@/lib/types";
import { spotifyTrackUrl, spotifyEmbedUrl } from "@/lib/spotify";
import SpotifyPlaybackEmbed from "./spotify-playback-embed";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type Playback = {
  active: Track | null;
  playing: boolean;
  open: (track: Track, tracks?: Track[]) => void;
};

const PlaybackContext = createContext<Playback | null>(null);

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) throw new Error("PlaybackProvider가 필요합니다.");
  return context;
}

function playable(track: Track) {
  return !!track.audioUrl || !!spotifyEmbedUrl(track.spotifyTrackId);
}

export default function PlaybackProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const dock = useRef<HTMLElement>(null);
  const active = queue.find(track => track.id === activeId) || null;
  const activeIndex = queue.findIndex(track => track.id === activeId);

  useEffect(() => {
    document.body.classList.toggle("has-playback-dock", !!active);
    if (!active || !dock.current) {
      document.body.style.removeProperty("--playback-dock-height");
      return () => document.body.classList.remove("has-playback-dock");
    }
    const element = dock.current;
    const observer = new ResizeObserver(() => document.body.style.setProperty("--playback-dock-height", `${element.offsetHeight}px`));
    observer.observe(element);
    document.body.style.setProperty("--playback-dock-height", `${element.offsetHeight}px`);
    return () => { observer.disconnect(); document.body.classList.remove("has-playback-dock"); document.body.style.removeProperty("--playback-dock-height"); };
  }, [active]);

  function open(track: Track, tracks?: Track[]) {
    if (!playable(track)) return;
    if (tracks) setQueue(tracks.filter(playable));
    setError("");
    if (active?.id === track.id) {
      if (track.audioUrl && !track.spotifyTrackId) {
        if (playing) audio.current?.pause();
        else void audio.current?.play().catch(() => setError("음원을 재생할 수 없습니다. 재생 버튼을 다시 눌러 주세요."));
      }
      return;
    }
    setActiveId(track.id);
    if (track.audioUrl && !track.spotifyTrackId && audio.current) {
      if (audio.current.src !== new URL(track.audioUrl, window.location.href).href) audio.current.src = track.audioUrl;
      void audio.current.play().catch(() => setError("음원을 재생할 수 없습니다. 재생 버튼을 다시 눌러 주세요."));
    } else {
      audio.current?.pause();
      setPlaying(false);
    }
  }

  function close() {
    audio.current?.pause();
    setQueue([]);
    setActiveId(null);
    setQueueOpen(false);
    setPlaying(false);
    setError("");
  }

  return <PlaybackContext.Provider value={{ active, playing, open }}>
    {children}
    <aside ref={dock} className={`playback-dock ${active ? "is-open" : ""}`} aria-label="음악 플레이어" aria-hidden={!active}>
      <div className="playback-dock-inner">
        <div className="playback-dock-topline">
          <span className="eyebrow">KEYOFF <span aria-hidden="true">/</span> THE LISTENING ROOM</span>
          <button type="button" className="playback-dock-close" onClick={close} aria-label="플레이어 닫기">닫기 <span aria-hidden="true">×</span></button>
        </div>
        <div className="playback-dock-stage">
          {active && <div className="playback-dock-current">
            <p className="eyebrow">NOW SELECTED <span>{String(activeIndex + 1).padStart(2, "0")} / {String(queue.length).padStart(2, "0")}</span></p>
            <strong>{active.title}</strong>
            <span className="playback-dock-credit">{active.creditedArtist || active.artist || "KEYOFF"}</span>
            {active.artist && active.creditedArtist && <span className="playback-dock-label">KEYOFF / {active.artist}</span>}
            <div className="playback-dock-stepper" aria-label="곡 이동">
              <button type="button" onClick={() => open(queue[activeIndex - 1])} disabled={activeIndex <= 0} aria-label="이전 곡"><span aria-hidden="true"><KeyboardArrowLeftIcon/></span><small>PREV</small></button>
              <button type="button" onClick={() => open(queue[activeIndex + 1])} disabled={activeIndex < 0 || activeIndex >= queue.length - 1} aria-label="다음 곡"><small>NEXT</small><span aria-hidden="true"><KeyboardArrowRightIcon/></span></button>
            </div>
            <p className="playback-dock-note">KEYOFF가 참여한 음악을 만나보세요.</p>
          </div>}
          <div className="playback-dock-art" aria-hidden="true">
            <span className="playback-orbit playback-orbit-outer" />
            <span className="playback-orbit playback-orbit-inner" />
            <div className={`playback-record ${playing ? "is-playing" : ""}`}>
              <div className="playback-record-label"><span>KEYOFF</span><small>LISTENING ROOM</small></div>
            </div>
          </div>
          <div className="playback-dock-side">
            <div className="playback-dock-side-heading">
              <span className="eyebrow">LISTEN HERE</span>
              <span className="playback-dock-source">{active?.spotifyTrackId ? "SPOTIFY" : "AUDIO"}</span>
            </div>
            <p className="playback-dock-instruction">{active?.spotifyTrackId ? "아래 Spotify 플레이어에서 재생을 눌러 감상하세요." : "아래 플레이어에서 재생을 눌러 감상하세요."}</p>
            <div className="playback-dock-player">
              {active?.spotifyTrackId && <SpotifyPlaybackEmbed trackId={active.spotifyTrackId} title={active.title} onPlayingChange={setPlaying} />}
              <audio ref={audio} className={active?.audioUrl && !active.spotifyTrackId ? "playback-native-audio is-visible" : "playback-native-audio"} controls={!!active?.audioUrl && !active.spotifyTrackId} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { const next = queue[activeIndex + 1]; if (next) open(next); else setPlaying(false); }} onError={() => { if (active?.audioUrl) setError("음원을 불러올 수 없습니다."); }} />
            </div>
            {active?.spotifyTrackId && <a className="playback-spotify-link" href={spotifyTrackUrl(active.spotifyTrackId)} target="_blank" rel="noopener noreferrer">SPOTIFY에서 열기 <span aria-hidden="true">↗</span></a>}
            {active && error && <p className="playback-dock-error" role="alert">{error}</p>}
            <div className="playback-dock-queue-block">
              <button type="button" className="playback-dock-queue-button" onClick={() => setQueueOpen(value => !value)} aria-expanded={queueOpen} aria-controls="playback-queue"><span>Track List<b>{queue.length}</b></span><span aria-hidden="true">{queueOpen ? "−" : "+"}</span></button>
              {active && <div id="playback-queue" className="playback-queue" hidden={!queueOpen}>
                <ol>{queue.map((track, index) => <li key={track.id} className={active.id === track.id ? "is-active" : ""}>
                  <button type="button" onClick={() => open(track)} aria-current={active.id === track.id ? "true" : undefined}><span>{String(index + 1).padStart(2, "0")}</span><span>{track.title}<small>{track.creditedArtist || track.artist || ""}</small></span></button>
                </li>)}</ol>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </aside>
  </PlaybackContext.Provider>;
}
