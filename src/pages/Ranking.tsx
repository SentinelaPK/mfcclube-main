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
  rankingTop14: RankingEntry[];
  clubName: string;
  logoUrl?: string;
  dateLabel: string;
}

const RankingImage = forwardRef<HTMLDivElement, RankingImageProps>(
  ({ rankingTop14, clubName, logoUrl, dateLabel }, ref) => {
    const top3 = rankingTop14.slice(0, 3);
    const middle = rankingTop14.slice(3, 12);
    const bottom = rankingTop14.slice(12, 14);

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1920px",
          backgroundImage: "radial-gradient(circle at top, #0b2a4a 0%, #020409 55%, #000 100%)",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "64px",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          {logoUrl && <img src={logoUrl} alt="Logo" style={{ height: "140px", marginBottom: "20px" }} />}
          <h1 style={{ fontSize: "48px", fontWeight: 900 }}>{clubName}</h1>
          <p style={{ fontSize: "26px", color: "#facc15", marginTop: "6px" }}>Ranking Geral – Top 14</p>
          <p style={{ fontSize: "18px", opacity: 0.7 }}>{dateLabel}</p>
        </div>

        {/* PODIUM */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {/* 2º */}
          <Podium name={top3[1]?.playerName} points={top3[1]?.points} color="#cbd5e1" height={160} trophy="🥈" />

          {/* 1º */}
          <Podium name={top3[0]?.playerName} points={top3[0]?.points} color="#facc15" height={200} trophy="🥇" main />

          {/* 3º */}
          <Podium name={top3[2]?.playerName} points={top3[2]?.points} color="#f97316" height={140} trophy="🥉" />
        </div>

        {/* TABLE HEADER */}
        <Row header>
          <Cell w={60}>Pos</Cell>
          <Cell flex>Jogador</Cell>
          <Cell w={60}>J</Cell>
          <Cell w={60}>V</Cell>
          <Cell w={60}>E</Cell>
          <Cell w={60}>D</Cell>
          <Cell w={80}>%</Cell>
          <Cell w={80}>Pts</Cell>
        </Row>

        {/* MIDDLE */}
        {middle.map((p, i) => (
          <Row key={p.playerName}>
            <Cell w={60}>{i + 4}</Cell>
            <Cell flex>{p.playerName}</Cell>
            <Cell w={60}>{p.matches}</Cell>
            <Cell w={60}>{p.wins}</Cell>
            <Cell w={60}>{p.draws}</Cell>
            <Cell w={60}>{p.losses}</Cell>
            <Cell w={80}>{Math.round(p.aproveitamento)}%</Cell>
            <Cell w={80}>{p.points}</Cell>
          </Row>
        ))}

        {/* ZONA DE RISCO */}
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <div style={{ color: "#ef4444", fontWeight: 800, fontSize: "22px" }}>❌ Zona de risco</div>
          <div style={{ fontSize: "18px", opacity: 0.8 }}>Quem vai ser o bola murcha? ⚽</div>
        </div>

        {/* BOTTOM */}
        {bottom.map((p, i) => (
          <Row key={p.playerName} danger>
            <Cell w={60}>{i + 13}</Cell>
            <Cell flex>{p.playerName}</Cell>
            <Cell w={60}>{p.matches}</Cell>
            <Cell w={60}>{p.wins}</Cell>
            <Cell w={60}>{p.draws}</Cell>
            <Cell w={60}>{p.losses}</Cell>
            <Cell w={80}>{Math.round(p.aproveitamento)}%</Cell>
            <Cell w={80}>{p.points}</Cell>
          </Row>
        ))}

        {/* FOOTER */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
            fontSize: "14px",
            opacity: 0.6,
          }}
        >
          Ranking completo disponível no app
          <br />
          Gerado pelo app MFC
        </div>
      </div>
    );
  },
);

RankingImage.displayName = "RankingImage";
export default RankingImage;

/* COMPONENTS */

function Podium({ name, points, color, height, trophy, main }: any) {
  return (
    <div
      style={{
        width: main ? "300px" : "260px",
        height,
        background: `linear-gradient(135deg, ${color}33, #020617)`,
        borderRadius: "16px",
        textAlign: "center",
        padding: "16px",
        boxShadow: "0 0 30px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontSize: "36px" }}>{trophy}</div>
      <div style={{ fontSize: main ? "28px" : "22px", fontWeight: 800 }}>{name}</div>
      <div style={{ fontSize: main ? "26px" : "20px", marginTop: "4px" }}>{points} Pontos</div>
    </div>
  );
}

function Row({ children, header, danger }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        marginBottom: "6px",
        background: header
          ? "transparent"
          : danger
            ? "linear-gradient(90deg, #7f1d1d, #020617)"
            : "rgba(255,255,255,0.04)",
        fontWeight: header ? 800 : 500,
        borderBottom: header ? "2px solid #334155" : "none",
      }}
    >
      {children}
    </div>
  );
}

function Cell({ children, w, flex }: any) {
  return (
    <div
      style={{
        width: w,
        flex: flex ? 1 : "none",
        textAlign: w ? "center" : "left",
      }}
    >
      {children}
    </div>
  );
}
