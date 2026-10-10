import Link from "next/link";
import { redirect } from "next/navigation";
import { catalog, pageNumber } from "@/lib/api";
import TrackList from "@/components/track-list";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const metadata = { title: "Catalog" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = pageNumber((await searchParams).page);
  const collection = await catalog(page);

  if (page >= Math.max(1, collection.totalPages)) {
    redirect(`/catalog?page=${Math.max(0, collection.totalPages - 1)}`);
  }

  return (
    <main id="main" className="container collection-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">A COLLECTION OF OUR SOUNDS</p>
          <h1>Discography</h1>
          <p>KEYOFF 아티스트들의 음악을 한곳에서 만나보세요.</p>
        </div>
        <span className="small-label">THE KEYOFF COLLECTION</span>
      </div>
      <section className="catalog-section" aria-label="곡 목록">
        <TrackList tracks={collection.content} />
        {collection.totalPages > 1 && (
          <nav className="pagination" aria-label="곡 목록 페이지">
            {page > 0 && (
              <Link className="text-link" href={`/catalog?page=${page - 1}`}>
                <ArrowBackIcon aria-hidden="true" fontSize="small" /> 이전
              </Link>
            )}
            <span>{page + 1} / {collection.totalPages}</span>
            {page + 1 < collection.totalPages && (
              <Link className="text-link" href={`/catalog?page=${page + 1}`}>
                다음 <ArrowForwardIcon aria-hidden="true" fontSize="small" />
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
