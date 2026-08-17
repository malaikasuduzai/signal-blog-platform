// components/AuthorAvatar.jsx
// Renders an author's initials in a colored circle instead of a stock
// photo. Deterministic per name (same author -> same color everywhere:
// blog cards, blog details, admin tables) so avatars stay recognizable
// without depending on any external image URL.

const PALETTE = ["#332e8c", "#c57e22", "#1f6e3e", "#942c2c", "#0f6e73", "#7a3b8f"];

function getInitials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function colorForName(name) {
  const str = name || "";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function AuthorAvatar({ name, size = 40, className = "" }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorForName(name),
        color: "#fdfaf3",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: Math.max(10, Math.round(size * 0.4)),
        lineHeight: 1,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
