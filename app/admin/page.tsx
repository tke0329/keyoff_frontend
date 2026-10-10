import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, adminAccounts, pageNumber } from "@/lib/api";
import AdminWorkspace from "@/components/admin-workspace";
import LogoutButton from "@/components/logout-button";
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await currentSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN")
    redirect(
      session.slug
        ? `/artists/${encodeURIComponent(session.slug)}`
        : "/profile/edit",
    );
  const page = pageNumber((await searchParams).page);
  const accounts = await adminAccounts(page);
  return (
    <main id="main" className="container admin-main">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KEYOFF / ADMIN WORKSPACE</p>
          <h1>Artist Management</h1>
          <p>아티스트 계정과 공개 페이지 노출 순서를 관리합니다.</p>
        </div>
        <LogoutButton />
      </div>
      <AdminWorkspace accounts={accounts.content} />
      {accounts.totalPages > 1 && (
        <nav className="pagination" aria-label="관리자 계정 목록 페이지">
          {page > 0 && (
            <Link className="text-link" href={`/admin?page=${page - 1}`}>
              ← 이전
            </Link>
          )}
          <span>
            {page + 1} / {accounts.totalPages}
          </span>
          {page + 1 < accounts.totalPages && (
            <Link className="text-link" href={`/admin?page=${page + 1}`}>
              다음 →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
