import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { COLORS } from "@/components/three/palette";
import { SITE_NAME, SITE_URL } from "@/lib/tabs";

// The preview card shown when the site is shared on LinkedIn, Slack, X and
// so on. Every page uses it unless it defines its own.
export const alt = `${SITE_NAME} — Full Stack Developer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/profile-picture.jpeg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          color: "white",
          backgroundColor: COLORS.navy950,
          backgroundImage: `radial-gradient(circle at 25% 50%, ${COLORS.navy800} 0%, ${COLORS.navy950} 60%)`,
          borderBottom: `8px solid ${COLORS.cyan}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc}
          width={300}
          height={300}
          alt=""
          style={{
            borderRadius: 9999,
            border: `6px solid ${COLORS.cyan}`,
            boxShadow: `0 0 60px ${COLORS.cyan}66`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: COLORS.cyan,
            }}
          >
            Portfolio
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 40, color: "#cbd5e1" }}>Full Stack Developer</div>
          <div style={{ fontSize: 26, marginTop: 24, color: "#6b7db3" }}>
            {SITE_URL.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
