import { Suspense } from "react";
import type { Metadata } from "next";
import EventsPageClient from "./EventsPageClient";
import EventCardSkeleton from "./components/EventCardSkeleton";

export const metadata: Metadata = { title: "Events" };

export default function EventPage() {
  return (
    <Suspense fallback={<EventCardSkeleton count={6} />}>
      <EventsPageClient />
    </Suspense>
  );
}
