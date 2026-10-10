import Link from "next/link";
import { safeUrl } from "@/lib/api";
import type { Artist } from "@/lib/types";
import { formatArtistParts } from "@/lib/artist-parts";


export default function ArtistGrid({ items }: { items: Artist[] }) {
  return (
    <div className="artist-grid">
      {items.map((a, i) => {
        const imageUrl = safeUrl(a.profileImage);
        return (
          <Link className={`artist-card${imageUrl ? "" : " artist-card--empty"}`} href={`/artists/${a.slug}`} key={a.slug}>
            <div
              className="artist-image"
              style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
            />
            {!imageUrl && <span className="card-monogram" aria-hidden="true">{Array.from(a.name.trim())[0] ?? "K"}</span>}
            <span className="card-index">
              {String(i + 1).padStart(2, "0")} / KEYOFF
            </span>
            <div className="card-caption">
              <h3>{a.name}</h3>
              {formatArtistParts(a.artistPart) && <p>{formatArtistParts(a.artistPart)}</p>}
            </div>
          
          </Link>
        );
      })}
    </div>
  );
}
