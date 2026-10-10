import Link from "next/link";
import { artists } from "@/lib/api";
import ArtistGrid from "@/components/artist-grid";
export const metadata = { title: "Artists" };
export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const requested = Number(query.page);
  const page =
    Number.isSafeInteger(requested) && requested >= 0 ? requested : 0;
  const roster = await artists(page);
  return (
    <main id="main" className="container collection-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE PEOPLE BEHIND THE SOUND</p>
          <h1>
            The Artists<span className="gold">.</span>
          </h1>
          <p>각자의 세계를 음악으로 펼치는 아티스트들을 만나보세요.</p>
        </div>
        <span className="small-label">
          {String(roster.totalElements).padStart(2, "0")} CREATIVE VOICES
        </span>
      </div>
      <ArtistGrid items={roster.content} />
      {!roster.content.length && (
        <p className="empty">새로운 아티스트를 준비하고 있습니다.</p>
      )}
      {roster.totalPages > 1 && (
        <nav className="pagination" aria-label="아티스트 페이지">
          {page > 0 && (
            <Link className="text-link" href={`/artists?page=${page - 1}`}>
              ← 이전
            </Link>
          )}
          <span>
            {page + 1} / {roster.totalPages}
          </span>
          {page + 1 < roster.totalPages && (
            <Link className="text-link" href={`/artists?page=${page + 1}`}>
              다음 →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
