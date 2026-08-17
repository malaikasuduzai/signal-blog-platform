// app/dashboard/loading.js
// Covers every /dashboard/* page (My Blogs, Submit, Drafts, Pending,
// Approved, Rejected) -- the sidebar stays put since it lives in
// layout.js, only this content area shows while the page's data loads.

export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 64,
            borderRadius: 14,
            background: "linear-gradient(90deg, #efeee8 25%, #f7f7f4 37%, #efeee8 63%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.4s ease infinite",
          }}
        />
      ))}
      <style>{`@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }`}</style>
    </div>
  );
}
