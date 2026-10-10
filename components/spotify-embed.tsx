import { spotifyEmbedUrl } from "@/lib/spotify";

export default function SpotifyEmbed({ trackId, title }: { trackId: string; title: string }) {
  const src = spotifyEmbedUrl(trackId);
  if (!src) return null;
  return <iframe
    className="spotify-embed"
    src={src}
    title={`${title} Spotify 플레이어`}
    width="100%"
    height="152"
    loading="lazy"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  />;
}
