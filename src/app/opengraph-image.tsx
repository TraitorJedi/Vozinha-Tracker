import { ImageResponse } from "next/og";

export const alt = "Vozinha Tracker follower race preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#000403",
          color: "#f3f4ff",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 16%, rgba(0,242,154,0.28), transparent 30%), linear-gradient(90deg, rgba(0,242,154,0.08) 1px, transparent 1px), linear-gradient(rgba(0,242,154,0.08) 1px, transparent 1px)",
            backgroundSize: "auto, 96px 96px, 96px 96px"
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ color: "#00f29a", fontSize: 44, fontWeight: 900, letterSpacing: "-0.08em" }}>
            vozinha tracker
          </div>
          <div
            style={{
              border: "1px solid #282844",
              borderRadius: 999,
              padding: "12px 20px",
              color: "#a5a4c2",
              fontSize: 22,
              letterSpacing: "0.12em",
              textTransform: "uppercase"
            }}
          >
            live follower race
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative" }}>
          <div style={{ color: "#a5a4c2", fontSize: 30, letterSpacing: "0.08em" }}>Can Vozinha catch Tom Brady?</div>
          <div style={{ color: "#00f29a", fontSize: 96, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.08em" }}>
            Follow the chase in real time.
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, position: "relative" }}>
          {[
            ["@vozinha1", "challenger", "#00f29a"],
            ["@tombrady", "the benchmark", "#36a4ff"]
          ].map(([handle, label, color]) => (
            <div
              key={handle}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                border: "1px solid #282844",
                borderRadius: 24,
                padding: 28,
                background: "rgba(6, 7, 13, 0.86)"
              }}
            >
              <div style={{ color, fontSize: 46, fontWeight: 900, letterSpacing: "-0.06em" }}>{handle}</div>
              <div style={{ color: "#a5a4c2", fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
