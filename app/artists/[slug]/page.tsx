import Link from "next/link";
import { notFound } from "next/navigation";
import {
  artist,
  careers,
  tracks,
  currentSession,
  ApiError,
  safeUrl,
} from "@/lib/api";
import { SectionTitle } from "@/components/shell";
import TrackList from "@/components/track-list";
import CareerList from "@/components/career-list";
import { formatArtistParts } from "@/lib/artist-parts";
export default async function ArtistDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [profile, history, works, session] = await Promise.all([
    artist(slug).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
    }),
    careers(slug),
    tracks(slug),
    currentSession(),
  ]);
  const isOwner = session?.role === "ARTIST" && session.slug === slug;
  return (
    <main id="main" className="container detail-main">
      <div className="detail-topline">
        <Link href="/artists">← ALL ARTISTS</Link>
        <span>KEYOFF / ARTIST PROFILE</span>
      </div>
      <div className="profile-grid">
        <aside>
          <div
            className="portrait"
            style={
              safeUrl(profile.profileImage)
                ? { backgroundImage: `url("${safeUrl(profile.profileImage)}")` }
                : undefined
            }
          >
            <div>
              <h1>{profile.name}</h1>
              {formatArtistParts(profile.artistPart) && (
                <p className="eyebrow">{formatArtistParts(profile.artistPart)}</p>
              )}
            </div>
          </div>
          <div className="profile-links">
            {safeUrl(profile.snsLink) && (
              <a
                href={safeUrl(profile.snsLink)}
                target="_blank"
                rel="noreferrer"
              >
                SOCIAL PROFILE ↗
              </a>
            )}
            <span>BASED IN SOUND.</span>
          </div>
          {isOwner && (
            <Link className="button edit-link" href="/profile/edit">
              프로필 수정
            </Link>
          )}
        </aside>
        <div className="profile-content">
          <section>
            <SectionTitle number="01">The Vision</SectionTitle>
            <div className="bio-card">
              <span className="bio-star" aria-hidden="true">
                ✦
              </span>
              <p className="eyebrow">IN THEIR OWN WORDS</p>
              <p className="biography">
                {profile.biography || "아티스트의 이야기를 준비하고 있습니다."}
              </p>
            </div>
          </section>
          <section>
            <SectionTitle number="02">Career & History</SectionTitle>
            <CareerList items={history} />
          </section>
          <section>
            <SectionTitle number="03">Selected Works</SectionTitle>
            <TrackList
              tracks={works.map((t) => ({
                ...t,
                audioUrl: safeUrl(t.audioUrl) || null,
              }))}
            />
          </section>
          <div className="profile-end">
            <span className="gold">✦</span>
            <h3>More voices. New perspectives.</h3>
            <Link className="text-link" href="/artists">
              다른 아티스트 만나보기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
