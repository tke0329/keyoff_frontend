import Image from "next/image";
import Link from "next/link";
import { posters } from "./posters";
import styles from "./about.module.css";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';


export const metadata = { title: "About" };
const copy = {
  intro: "서로 다른 음악적 배경에서 출발한 두 작곡가가 함께하는 음악 크리에이티브 팀입니다",
  first:
    "서로 다른방식 으로 음악을 배우고 만들어왔습니다. 각자의 언어와 감각은 다르지만, 하나의 음악을 위해 만나 새로운 사운드를 만들어갑니다.",
  second:
    "장르나 형식에 경계를 두기보다, 음악이 필요한 순간에 가장 어울리는 소리를 찾는 것. 그것이 KEYOFF가 음악을 만드는 방식입니다.",
  third: "",
  works:
    "드라마와 영화, 공연, 방송, 그리고 아티스트의 음악까지. 다양한 장면에 닿은 KEYOFF의 작업을 만나보세요.",
};

function PosterGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className={styles.posterGroup} aria-hidden={duplicate || undefined}>
      {posters.map((poster) => (
        <figure className={styles.poster} key={poster.src}>
          <Image
            src={poster.src}
            alt={duplicate ? "" : `${poster.title} 포스터`}
            width={poster.width}
            height={poster.height}
            sizes="(max-width: 700px) 160px, 220px"
          />
          <figcaption>
            <span>{poster.category}</span>
            <strong>{poster.title}</strong>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>ABOUT KEYOFF</p>
        <h2>Two Perspectives. One Sound<span className={styles.period}>.</span></h2>
        
        <p><b><em>KEYOFF</em></b> 는 {copy.intro}</p>
      </header>

      <section className={styles.artworkSection} aria-label="KEYOFF 소개 이미지">
        <div className={styles.artwork}>
          <Image
            src="/keyoff/about/keyoff-main.png"
            alt="어두운 배경 위에 빛나는 KEYOFF 로고"
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1100px"
          />
        </div>
        <div className={styles.artworkCaption}>
          <span>KEYOFF / MUSIC COLLECTIVE</span>
          <span>WHERE STORIES FIND THEIR SOUND</span>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="about-story-title">
        <p className={styles.eyebrow}>01 / OUR STORY</p>
        <h2 id="about-story-title">KEYOFF 의 두 <em>작곡가는</em></h2>
        <div className={styles.storyCopy}>
          <p>{copy.first}</p>
          <p>{copy.second}</p>
        </div>
        <br/><br/><br/>
        <p className={styles.eyebrow}>02 / OUR ORIENTATION</p>
        <h2 id="about-story-title">Music Without  <em>Boundaries.</em></h2>
        <div className={styles.storyCopy}>
          <p>KEYOFF는 <em>Original Music, Film Scoring, Songwriting & Arrangement</em> 를 중심으로 다양한 음악을 만듭니다.</p>
          <p>영상과 이야기를 위한 음악부터 하나의 독립된 곡, 아티스트를 위한 <em>작곡과 편곡</em>까지. 오케스트라의 <em>섬세한 움직임과 현대적인 사운드,</em> 대중음악의 감각을 자유롭게 오가며 프로젝트마다 새로운 음악적 방향을 만들어냅니다.</p>
          <p>우리는 하나의 스타일에 머무르기보다 각 음악이 <em>무엇을 필요로 하는지</em>에서 시작합니다</p>
        </div>
        <Link href="/artists" className={styles.storyLink}>
          아티스트 만나보기 <span aria-hidden="true"><ArrowOutwardIcon/></span>
        </Link>
      </section>
      <section className={styles.work} aria-labelledby="about-work-title">
        <div className={styles.workHeading}>
          <div>
            <p className={styles.eyebrow}>02 / SELECTED WORKS</p>
            <h2 id="about-work-title">Stories in sound<span className={styles.period}>.</span></h2>
          </div>
          <p>{copy.works}</p>
        </div>
        <div className={styles.marquee} aria-label="KEYOFF 참여 작품 포스터">
          <div className={styles.posterTrack}>
            <PosterGroup />
            <PosterGroup duplicate />
          </div>
        </div>
        <div className={styles.workFooter}>
          <span>KEYOFF PORTFOLIO</span>
          <span>{String(posters.length).padStart(2, "0")} SELECTED IMAGES</span>
        </div>
      </section>

      
      <section className={styles.story} aria-labelledby="about-story-title"> 
        <h2 id="about-story-title">We Make Music That Connects.  <em>Boundaries.</em></h2>
        <div className={styles.storyCopy}>
          <p>사람과 이야기, 이미지와 감정.  <em>KEYOFF</em>는 그 사이를 음악으로 연결합니다</p>
        </div>
      </section>
    </main>
  );
}
