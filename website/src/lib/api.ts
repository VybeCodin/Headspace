import type {
  TodayData,
  ExploreData,
  Content,
  CollectionDetail,
  LumaData,
  ChatMessage,
  ProfileData,
} from "./types";

const BASE_URL = "https://headspace-api.vercel.app/api";
const USER_ID = "usr_001";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchToday(): Promise<TodayData> {
  return apiFetch<TodayData>(`/users/${USER_ID}/today`);
}

export async function fetchExplore(): Promise<ExploreData> {
  return apiFetch<ExploreData>("/explore");
}

export async function fetchContent(id: string): Promise<Content> {
  return apiFetch<Content>(`/content/${id}`);
}

export async function fetchContentByCategory(categoryId: string): Promise<Content[]> {
  return apiFetch<Content[]>(`/content?category=${categoryId}`);
}

export async function fetchCollection(id: string): Promise<CollectionDetail> {
  return apiFetch<CollectionDetail>(`/collections/${id}`);
}

export async function fetchLuma(): Promise<LumaData> {
  return apiFetch<LumaData>(`/users/${USER_ID}/luma`);
}

export async function sendLumaMessage(text: string): Promise<ChatMessage> {
  const res = await fetch(`${BASE_URL}/users/${USER_ID}/luma/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>(`/users/${USER_ID}/profile`);
}
