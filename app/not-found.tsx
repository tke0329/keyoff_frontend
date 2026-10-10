import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container status-page">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>아직 쓰이지 않은 이야기.</h1>
      <p>요청하신 페이지를 찾을 수 없습니다.</p>
      <Link className="button" href="/">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
