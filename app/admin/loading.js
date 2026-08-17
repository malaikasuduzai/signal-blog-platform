// app/admin/loading.js
// Covers every /admin/* page (Blog Management, Pending Review, Users,
// Categories, etc.) -- same idea as app/dashboard/loading.js.

export default function AdminLoading() {
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
