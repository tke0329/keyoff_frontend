const trackIdPattern = /^[A-Za-z0-9]{22}$/;

export function spotifyTrackId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const match = /^\/track\/([A-Za-z0-9]{22})$/.exec(url.pathname);
    return url.protocol === "https:" && url.hostname === "open.spotify.com" &&
      !url.username && !url.password && !url.port && !url.hash && match ? match[1] : null;
  } catch {
    return null;
  }
}

export function spotifyEmbedUrl(id?: string | null): string | null {
  return id && trackIdPattern.test(id) ? `https://open.spotify.com/embed/track/${id}` : null;
}

export function spotifyTrackUrl(id?: string | null): string {
  return id && trackIdPattern.test(id) ? `https://open.spotify.com/track/${id}` : "";
}
