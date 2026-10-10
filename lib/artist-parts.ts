export const artistParts = [
  { value: "COMPOSER", label: "COMPOSER" },
  { value: "PLAYER", label: "PLAYER" },
  { value: "VOCAL", label: "VOCAL" },
  { value: "RECORDING_ENGINEER", label: "RECORDING ENGINEER" },
  { value: "MIX_ENGINEER", label: "MIX ENGINEER" },
  { value: "TOP_LINER", label: "TOP LINER" },
  { value: "TRACK_MAKER", label: "TRACK MAKER" },
] as const;

export type ArtistPart = (typeof artistParts)[number]["value"];

export function formatArtistParts(parts?: readonly ArtistPart[] | null) {
  const selected = new Set(parts);
  return artistParts
    .filter(({ value }) => selected.has(value))
    .map(({ label }) => label)
    .join(" / ");
}
