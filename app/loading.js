// app/loading.js
// Shown instantly on navigation while a page's server-side data fetch is
// still in flight, instead of leaving the screen blank/frozen. This is
// what actually fixes the "feels slow when I open a new page" complaint
// -- the data fetch itself takes the same time, but the user sees
// immediate feedback instead of nothing happening.

export default function Loading() {
  return (
    <div style={{ padding: "80px 24px", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "3px solid #e3e2da",
          borderTopColor: "#332e8c",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
