import Link from "next/link";
import BlackHoleHeroSection from "../components/blackhole-section";
import MotionButton from "@/components/button";
import ArrowOutwardIcon from "@/components/arrow-outward-icon";
import ArrowDropDownIcon from "@/components/arrow-drop-down-icon";

export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="sound-art" aria-hidden="true">
          <BlackHoleHeroSection
            className="blackhole-section"
            focus={[0.75, 0.5]}
            hotColor="#fff2db"
            midColor="#ffb700"
            coolColor="#78340e"
            scrim="left"
            scrimStrength={0.85}
            steps={160}
            resolution={1}
            maxDpr={1.5}
            maxPixels={1_400_000}
            maxFps={30}
            glow={0.7}
          />
        </div>
        <div className="hero-inner container">
          <div className="hero-copy">
            <p className="eyebrow">ORIGINAL MUSIC | FILM SCORING | ARRANGEMENT</p>
            <h1>
              Every Frame
              <br />
              Defined <em>By One Sound.</em>
            </h1>
            <p className="hero-description">
              모든 순간에는 저마다의 리듬과 감정이 있습니다.
              <br />
              <em>KEYOFF</em>는 이를 음악으로 담아냅니다.
            </p>
            <div className="hero-actions">
              <MotionButton href="/artists" label="MEET THE ARTISTS" />
              <Link className="text-link hero-text-link" href="/catalog">
                <span className="hero-text-link-layer">
                  EXPLORE OUR SOUND
                  <span className="hero-text-link-icon" aria-hidden="true">
                    <ArrowOutwardIcon />
                  </span>
                </span>
                <span className="hero-text-link-layer hero-text-link-reveal" aria-hidden="true">
                  EXPLORE OUR SOUND
                  <span className="hero-text-link-icon">
                    <ArrowOutwardIcon />
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <div className="hero-bottom">
            <span>MUSIC CONNECTS EVERYTHING</span>
            <span>SCROLL TO DISCOVER <ArrowDropDownIcon /></span>
          </div>
        </div>
      </section>
    </main>
  );
}
