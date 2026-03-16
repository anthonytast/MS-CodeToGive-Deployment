"use client";

import { useState } from "react";
import styles from "./RegisterButton.module.css";

type LocalStatus = "idle" | "loading" | "error";

interface RegisterButtonProps {
  eventId: string;
  isRegistered: boolean;
  isLoadingExternal?: boolean;
  onRegister: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  small?: boolean;
}

export default function RegisterButton({
  eventId,
  isRegistered,
  isLoadingExternal,
  onRegister,
  onCancel,
  small,
}: RegisterButtonProps) {
  const [localStatus, setLocalStatus] = useState<LocalStatus>("idle");
  const [showConfirm, setShowConfirm] = useState(false);

  // Derive display state from props + local status
  const btnState =
    localStatus === "loading"
      ? "loading"
      : localStatus === "error"
      ? "error"
      : isRegistered
      ? "registered"
      : "idle";

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (localStatus === "loading") return;
    if (isRegistered) {
      setShowConfirm(true);
      return;
    }
    setLocalStatus("loading");
    try {
      await onRegister(eventId);
      setLocalStatus("idle");
    } catch {
      setLocalStatus("error");
      setTimeout(() => setLocalStatus("idle"), 1500);
    }
  }

  async function confirmCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setShowConfirm(false);
    setLocalStatus("loading");
    try {
      await onCancel(eventId);
      setLocalStatus("idle");
    } catch {
      setLocalStatus("error");
      setTimeout(() => setLocalStatus("idle"), 1500);
    }
  }

  const stateClass = styles[btnState];
  const label = (() => {
    if (btnState === "loading" || isLoadingExternal) return <span className={styles.spinner} />;
    if (btnState === "registered") return "Registered ✓";
    if (btnState === "error") return "Try Again";
    return "Register";
  })();

  return (
    <>
      <button
        className={`${styles.btn} ${stateClass} ${small ? styles.small ?? "" : ""}`}
        onClick={handleClick}
        disabled={btnState === "loading" || isLoadingExternal}
        aria-label={btnState === "registered" ? "Cancel registration" : "Register for event"}
      >
        {label}
      </button>

      {showConfirm && (
        <>
          <div
            onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
              backdropFilter: "blur(2px)",
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
            background: "white",
            borderRadius: "var(--lt-radius-lg)",
            padding: "32px 28px",
            maxWidth: 380,
            width: "calc(100vw - 48px)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            textAlign: "center",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--lt-text-primary)", marginBottom: 10 }}>
              Unregister from this event?
            </h2>
            <p style={{ fontSize: 14, color: "var(--lt-text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
              Your spot will be released and you won&apos;t be registered anymore.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                style={{
                  padding: "10px 22px", fontSize: 14, fontWeight: 600,
                  borderRadius: "var(--lt-radius-full)",
                  border: "2px solid var(--lt-border)",
                  background: "transparent", color: "var(--lt-text-secondary)",
                  cursor: "pointer",
                }}
              >
                Keep registration
              </button>
              <button
                onClick={confirmCancel}
                style={{
                  padding: "10px 22px", fontSize: 14, fontWeight: 700,
                  borderRadius: "var(--lt-radius-full)",
                  border: "none",
                  background: "var(--lt-error)", color: "white",
                  cursor: "pointer",
                }}
              >
                Yes, unregister
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
