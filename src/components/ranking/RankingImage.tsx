import { forwardRef } from "react";

interface RankingEntry {
  playerName: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  aproveitamento: number;
  points: number;
}

interface RankingImageProps {
  rankingTop14?: RankingEntry[];
  clubName?: string;
  logoUrl?: string;
  dateLabel?: string;
}

const RankingImage = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { rankingTop14 = [], clubName = "Mentira Futebol Clube", logoUrl, dateLabel = "" } = props as RankingImageProps;

  const top3 = rankingTop14.slice(0, 3);
  const bottom2 = rankingTop14.slice(-2);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1920px",
        background: "linear-gradient(180deg, #0b0b0b 0%, #111 60%, #0b0b0b 100%)",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "56px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center" }}>
        {logoUrl && <img src={logoUrl} alt="Logo" style={{ height: "90px", marginBottom: "16px" }} />}

        <h1 style={{ fontSize: "42px", fontWeight: 900, margin: 0 }}>{clubName}</h1>
        <p style={{ fontSize: "20px", opacity: 0.85, marginTop: "6px" }}>Ranking Geral</p>
        <p style={{ fontSize: "14px", opacity: 0.6 }}>{dateLabel}</p>
      </div>

      {/* TOP 3 */}
      <div>
        <h2
          style={{
            textAlign: "center",
            fontSize: "28px",
            marginBottom: "24px",
            color: "#facc15",
          }}
        >
          🏆 TOP 3
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
          }}
        >
          {top3.map((p, i) => (
            <div
              key={p.playerName}
              style={{
                background: i === 0 ? "linear-gradient(180deg,#facc15,#ca8a04)" : "#1f1f1f",
                color: i === 0 ? "#000" : "#fff",
                borderRadius: "20px",
                width: i === 0 ? "300px" : "240px",
                padding: "24px",
                textAlign: "center",
                boxShadow: i === 0 ? "0 0 40px rgba(250,204,21,0.4)" : "0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ fontSize: "22px", fontWeight: 800 }}>{i + 1}º</div>
              <div style={{ fontSize: "26px", fontWeight: 900, marginTop: "8px" }}>{p.playerName}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "6px" }}>{p.points} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM */}
      <div>
        <h2
          style={{
            textAlign: "center",
            fontSize: "26px",
            marginBottom: "16px",
            color: "#ef4444",
          }}
        >
          😅 Quem vai ser o bola murcha?
        </h2>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {bottom2.map((p, i) => (
            <div
              key={p.playerName}
              style={{
                background: "#1a1a1a",
                border: "2px dashed #ef4444",
                borderRadius: "16px",
                width: "360px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700 }}>{rankingTop14.length - 1 + i}º</div>
              <div style={{ fontSize: "24px", fontWeight: 900, marginTop: "8px" }}>{p.playerName}</div>
              <div style={{ fontSize: "18px", marginTop: "4px" }}>{p.points} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", fontSize: "13px", opacity: 0.6 }}>
        Ranking completo disponível no app
        <br />
        Gerado pelo MFC
      </div>
    </div>
  );
});

RankingImage.displayName = "RankingImage";
export default RankingImage;
