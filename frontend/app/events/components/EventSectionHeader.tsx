import styles from "../events.module.css";

interface Props {
  title: string;
  count: number;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function EventSectionHeader({
  title,
  count,
  collapsible,
  isExpanded,
  onToggle,
}: Props) {
  return (
    <div
      className={styles.sectionHeader}
      onClick={collapsible ? onToggle : undefined}
      style={collapsible ? { cursor: "pointer" } : undefined}
      aria-expanded={collapsible ? isExpanded : undefined}
      role={collapsible ? "button" : undefined}
    >
      <span className={styles.sectionHeaderTitle}>{title}</span>
      <span className={styles.sectionHeaderCount}>{count}</span>
      {collapsible && (
        <span className={styles.sectionHeaderToggle}>
          {isExpanded ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}
