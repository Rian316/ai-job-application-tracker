import type { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { BookmarksList, type BookmarkRow } from "@/components/bookmarks/bookmarks-list";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookmarks"
        description="Saved job postings and companies to review later."
      />
      <BookmarksList bookmarks={bookmarks as unknown as BookmarkRow[]} />
    </div>
  );
}