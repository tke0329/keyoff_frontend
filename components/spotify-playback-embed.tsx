"use client";

import { useEffect, useRef, useState } from "react";
import SpotifyEmbed from "./spotify-embed";

type PlaybackEvent = {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    position: number;
    duration: number;
  };
};

type SpotifyController = {
  addListener: (
    event: "ready" | "playback_started" | "playback_update",
    callback: (event: PlaybackEvent) => void,
  ) => void;
  loadEntity: (uri: string) => void;
  destroy: () => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyController) => void,
  ) => void;
};

type SpotifyWindow = Window & {
  onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
};

let iframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadIframeApi() {
  if (iframeApiPromise) return iframeApiPromise;
  iframeApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    const spotifyWindow = window as SpotifyWindow;
    spotifyWindow.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      iframeApiPromise = null;
      reject(new Error("Spotify iframe API를 불러오지 못했습니다."));
    };
    document.body.appendChild(script);
  });
  return iframeApiPromise;
}

export default function SpotifyPlaybackEmbed({
  trackId,
  title,
  onPlayingChange,
}: {
  trackId: string;
  title: string;
  onPlayingChange: (playing: boolean) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const initialEntity = useRef(`spotify:track:${trackId}`);
  const currentEntity = useRef(`spotify:track:${trackId}`);
  const hasStarted = useRef(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let disposed = false;
    let readyTimeout: number | undefined;
    const wrapper = container.current;

    loadIframeApi().then((api) => {
      if (disposed || !wrapper) return;
      const mountPoint = document.createElement("div");
      wrapper.appendChild(mountPoint);
      api.createController(
        mountPoint,
        { uri: initialEntity.current, width: "100%", height: "152" },
        (created) => {
          if (disposed) {
            created.destroy();
            return;
          }
          controller.current = created;
          readyTimeout = window.setTimeout(() => {
            created.destroy();
            controller.current = null;
            wrapper.replaceChildren();
            setFallback(true);
          }, 8000);
          created.addListener("ready", () => window.clearTimeout(readyTimeout));
          if (currentEntity.current !== initialEntity.current) {
            created.loadEntity(currentEntity.current);
          }
          created.addListener("playback_started", () => {
            hasStarted.current = true;
            onPlayingChange(true);
          });
          created.addListener("playback_update", (event) => {
            onPlayingChange(
              !event.data.isPaused &&
              !event.data.isBuffering &&
              (hasStarted.current || event.data.position > 0),
            );
          });
        },
      );
    }).catch(() => {
      if (!disposed) setFallback(true);
    });

    return () => {
      disposed = true;
      window.clearTimeout(readyTimeout);
      controller.current?.destroy();
      controller.current = null;
      wrapper?.replaceChildren();
      onPlayingChange(false);
    };
  }, [onPlayingChange]);

  useEffect(() => {
    const entity = `spotify:track:${trackId}`;
    if (currentEntity.current === entity) return;
    currentEntity.current = entity;
    hasStarted.current = false;
    controller.current?.loadEntity(entity);
    onPlayingChange(false);
  }, [trackId, onPlayingChange]);

  if (fallback) return <SpotifyEmbed trackId={trackId} title={title} />;
  return <div ref={container} className="spotify-embed-host" aria-label={`${title} Spotify 플레이어`} />;
}
