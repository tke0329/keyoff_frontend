import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, currentSession, sessionCookie } from "@/lib/api";
import type { Artist, Career, Track } from "@/lib/types";
import ProfileEditor from "@/components/profile-editor";
export const metadata = {
  title: "Edit Profile",
  robots: { index: false, follow: false },
};
export default async function EditProfile() {
  const session = await currentSession();
  if (session?.role === "ADMIN") redirect("/admin");
  if (session?.role !== "ARTIST") redirect("/login");
  const token = (await cookies()).get(sessionCookie)!.value;
  const [me, history, playlist] = await Promise.all([
    api<Artist>("artist/me", token),
    api<Career[]>("career/me", token),
    api<Track[]>("playlist/me", token),
  ]);
  return (
    <main id="main" className="container editor-main">
      <p className="eyebrow">YOUR ARTIST SPACE</p>
      <h1>내 프로필 관리</h1>
      <ProfileEditor profile={me} history={history} playlist={playlist} />
    </main>
  );
}
