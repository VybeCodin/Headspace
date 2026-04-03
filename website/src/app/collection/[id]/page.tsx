import { fetchCollection, fetchUserProgress } from "@/lib/api";
import CollectionCourseView from "./CollectionCourseView";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, progress] = await Promise.all([
    fetchCollection(id),
    fetchUserProgress().catch(() => []),
  ]);

  return <CollectionCourseView collection={collection} initialProgress={progress} />;
}
