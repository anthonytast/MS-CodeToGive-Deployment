"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Event } from "@/app/types/event";
import { eventGradient } from "../utils/eventGradient";
import { highlightText } from "../utils/eventFilters";
import RegisterButton from "./RegisterButton";
import FlyerButton from "./FlyerButton";
import styles from "./EventCard.module.css";

function staticTileUrl(lat: number, lng: number, zoom = 14): string {
  const z = zoom;
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, z));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, z)
  );
  return `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
}

interface Props {
  event: Event;
  cardIndex?: number;
  searchQuery?: string;
  isPast?: boolean;
  onRegister: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  isLoadingId: string | null;
  currentUserId?: string;
}

export default function EventCard({
  event,
  cardIndex = 0,
  searchQuery = "",
  isPast,
  onRegister,
  onCancel,
  isLoadingId,
  currentUserId,
}: Props) {
  const router = useRouter();
  const gradient = eventGradient(event.title);
  const hasCoords = event.latitude != null && event.longitude != null;
  const isFull =
    event.volunteerLimit != null && event.registeredCount >= event.volunteerLimit;

  const titleHtml = highlightText(event.title, searchQuery);

  const dateDisplay = (() => {
    const d = new Date(event.date + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  return (
    <div
      className={styles.card}
      style={{ "--card-index": cardIndex } as React.CSSProperties}
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <div className={styles.imageWrapper}>
        {hasCoords ? (
          <div className={styles.mapContainer} style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={staticTileUrl(event.latitude!, event.longitude!)}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              draggable={false}
            />
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 14, height: 14,
              background: "#2E8B7A",
              borderRadius: "50%",
              border: "2.5px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }} />
          </div>
        ) : (
          <div
            className={styles.imagePlaceholder}
            style={{ background: gradient }}
          />
        )}
        {isPast && <span className={styles.pastBadge}>Past</span>}
      </div>

      {isPast && <div className={styles.pastOverlay} />}

      <div className={styles.body}>
        <div
          className={styles.title}
          // Query is regex-escaped in highlightText, safe to use here
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />

        <div className={styles.meta}>
          <span className={styles.metaIcon}>📅</span>
          {dateDisplay} &middot; {event.startTime}
        </div>

        {event.location && (
          <div className={styles.meta}>
            <span className={styles.metaIcon}>📍</span>
            {event.location}
          </div>
        )}

        <div className={styles.footer}>
          <span className={`${styles.capacity} ${isFull ? styles.capacityFull : ""}`}>
            👥 {event.registeredCount}
            {event.volunteerLimit != null ? `/${event.volunteerLimit}` : ""}
            {isFull ? " · Full" : ""}
          </span>

          {!isPast && (
            <div className={styles.hoverActions} onClick={(e) => e.stopPropagation()}>
              {event.latitude && event.longitude && (
                <FlyerButton eventId={event.id} small />
              )}
              {currentUserId && event.createdBy === currentUserId ? (
                <Link
                  href={`/events/${event.id}/manage`}
                  onClick={(e) => e.stopPropagation()}
                  className={styles.manageBtn}
                >
                  Manage
                </Link>
              ) : (
                <RegisterButton
                  eventId={event.id}
                  isRegistered={event.isRegistered}
                  isLoadingExternal={isLoadingId === event.id}
                  onRegister={onRegister}
                  onCancel={onCancel}
                  small
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
