import type { RecordType } from "./record-types";
import type { ArtistPart } from "./artist-parts";
export type Artist = {
  slug: string;
  name: string;
  artistPart: ArtistPart[];
  profileImage: string | null;
  biography?: string | null;
  phoneNumber?: string | null;
  snsLink?: string | null;
};
export type Career = {
  dateMode: "RANGE" | "SINGLE";
  recordType: RecordType;
  id: number;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  displayOrder: number | null;
};
export type Track = {
  id: number;
  title: string;
  creditedArtist?: string | null;
  audioUrl: string | null;
  spotifyTrackId: string | null;
  spotifyAlbumId?: string | null;
  displayOrder: number | null;
  artist?: string;
  artistSlug?: string;
};
export type ArtistPage = {
  content: Artist[];
  page: number;
  totalPages: number;
  totalElements: number;
};

export type Page<T> = {
  content: T[];
  page: number;
  totalPages: number;
  totalElements: number;
};
export type Session = { role: "ADMIN" | "ARTIST"; slug: string | null };
export type ArtistAccount = {
  id: number;
  username: string;
  status: "ACTIVE" | "DISABLED";
  artistId: number | null;
  artistName: string | null;
  slug: string | null;
  displayOrder: number | null;
};

export type MediaAsset = {
  id: string;
  url: string;
  kind: "AUDIO" | "IMAGE";
  contentType: string;
  byteSize: number;
};
