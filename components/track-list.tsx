"use client";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { spotifyEmbedUrl } from "@/lib/spotify";
import { usePlayback } from "./playback-dock";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';



export default function TrackList({ tracks }: { tracks: Track[] }) {
  const playback = usePlayback();
  return (
    <div className="track-list">
      {tracks.length ? (
        tracks.map((track, index) => (
          <div
            className={`track-row ${playback.active?.id === track.id ? "is-playing" : ""}`}
            key={track.id}
          >
            <span className="track-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="album-art" aria-hidden="true" />
            <div className="track-info">
              <h3>{track.title}</h3>
              {track.creditedArtist && <span className="track-credit">{track.creditedArtist}</span>}
              {track.artistSlug ? (
                <Link
                  className="track-artist"
                  href={`/artists/${encodeURIComponent(track.artistSlug)}`}
                >
                  {track.creditedArtist ? `KEYOFF / ${track.artist}` : track.artist}
                </Link>
              ) : (
                <span>{track.artist || "SELECTED WORK"}</span>
              )}
            </div>
            <button
              className="track-play"
              onClick={() => playback.open(track, tracks)}
              disabled={!track.audioUrl && !spotifyEmbedUrl(track.spotifyTrackId)}
              aria-label={`${track.title} ${track.spotifyTrackId ? "Spotify 플레이어 열기" : playback.active?.id === track.id && playback.playing ? "일시정지" : "재생"}`}
            >
              {track.spotifyTrackId ? <PlayArrowIcon/> : track.audioUrl
                ? playback.active?.id === track.id && playback.playing
                  ? <PauseIcon/>
                  : <PlayArrowIcon/>
                : "음원 준비 중"}
            </button>
          </div>
        ))
      ) : (
        <p className="empty">아직 등록된 음원이 없습니다.</p>
      )}
    </div>
  );
}
