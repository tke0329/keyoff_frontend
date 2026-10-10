import MainNav from "./main-nav";
import Link from "next/link";
import ArrowDropUpIcon from "./arrow-drop-up-icon";

function FooterArrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path fill="currentColor" d="M6.4 17.6 5 16.2 14.17 7H6V5h12v12h-2V8.83z" />
  </svg>;
}

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="KEYOFF 홈">
          <span className="brand-mark" aria-hidden="true" /> KEYOFF
          <span className="brand-small">MUSIC COLLECTIVE</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity">
          <span className="footer-kicker">MUSIC COLLECTIVE / KEYOFF</span>
          <Link className="footer-wordmark" href="/">KEYOFF<span>.</span></Link>
          <p>서로 다른 감각이 만나 하나의 소리가 되는 곳.</p>
        </div>
        <div className="footer-column">
          <p className="footer-heading">EXPLORE</p>
          <Link href="/artists">ARTISTS <span aria-hidden="true"><FooterArrow /></span></Link>
          <Link href="/catalog">CATALOG <span aria-hidden="true"><FooterArrow /></span></Link>
          <Link href="/about">ABOUT <span aria-hidden="true"><FooterArrow /></span></Link>
        </div>
        <div className="footer-column">
          <p className="footer-heading">FOLLOW</p>
          <a href="https://www.youtube.com/@Eeno_dls" target="_blank" rel="noopener noreferrer">YOUTUBE <span aria-hidden="true"><FooterArrow /></span></a>
          <a href="https://www.instagram.com/keyoff.lab/" target="_blank" rel="noopener noreferrer">INSTAGRAM <span aria-hidden="true"><FooterArrow /></span></a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} KEYOFF MUSIC COLLECTIVE.</p>
        <span>INDEPENDENT MINDS. TIMELESS SOUNDS.</span>
        <a href="#top">BACK TO TOP <ArrowDropUpIcon /></a>
      </div>
    </footer>
  );
}
export function SectionTitle({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-title">
      <span className="eyebrow">{number}</span>
      <h2>{children}</h2>
    </div>
  );
}
