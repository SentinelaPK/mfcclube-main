// src/pages/Lineup.tsx
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

import { usePlayers } from "@/hooks/usePlayers";
import { useUserRole } from "@/hooks/useUserRole";
import { Player } from "@/data/types";

/* ================= CANVAS CONFIG ================= */

const CANVAS_SIZE = 1080;
const SHIRT_SIZE = 160;

const OFFSET_X = 60;
const OFFSET_Y = 75;

const DATE_POSITION = { x: 145, y: 710 };
const DATE_FONT_SIZE = 65.9;

/* ================= POSIÇÕES ================= */

// TIME A
const positionsTimeA_7 = [
  { x: 625, y: 57.2 },
  { x: 852.2, y: 108 },
  { x: 426.9, y: 108 },
  { x: 852.2, y: 309.3 },
  { x: 429.1, y: 309.3 },
  { x: 718.4, y: 242.2 },
  { x: 570.7, y: 242.2 },
];

const positionsTimeA_6 = [
  { x: 625, y: 57.2 },
  { x: 852.2, y: 108 },
  { x: 426.9, y: 108 },
  { x: 852.2, y: 309.3 },
  { x: 429.1, y: 309.3 },
  { x: 634.2, y: 242.2 },
];

// TIME B
const positionsTimeB_7 = [
  { x: 625, y: 856 },
  { x: 426.9, y: 820.6 },
  { x: 847.7, y: 820.6 },
  { x: 426.9, y: 608 },
  { x: 847.7, y: 608 },
  { x: 570.7, y: 680.8 },
  { x: 718.4, y: 680.8 },
];

const positionsTimeB_6 = [
  { x: 625, y: 856 },
  { x: 426.9, y: 820.6 },
  { x: 847.7, y: 820.6 },
  { x: 426.9, y: 608 },
  { x: 847.7, y: 608 },
  { x: 632.4, y: 680.8 },
];

/* ================= COMPONENT ================= */

export default function Lineup() {
  const { data: players = [], isLoading } = usePlayers();
  const { isAdmin } = useUserRole();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [lineup, setLineup] = useState({
    date: new Date().toISOString().split("T")[0],
    teamA: [] as string[],
    teamB: [] as string[],
  });

  /* ===== SELEÇÃO (COM LIMITE + TOAST) ===== */

  const togglePlayer = (playerId: string, team: "A" | "B") => {
    setLineup((prev) => {
      if (team === "A") {
        if (prev.teamA.includes(playerId)) {
          return { ...prev, teamA: prev.teamA.filter((id) => id !== playerId) };
        }

        if (prev.teamA.length >= 7) {
          toast({
            title: "Limite atingido",
            description: "O Time A já possui 7 jogadores.",
            variant: "destructive",
          });
          return prev;
        }

        return {
          ...prev,
          teamA: [...prev.teamA, playerId],
          teamB: prev.teamB.filter((id) => id !== playerId),
        };
      }

      // TIME B
      if (prev.teamB.includes(playerId)) {
        return { ...prev, teamB: prev.teamB.filter((id) => id !== playerId) };
      }

      if (prev.teamB.length >= 7) {
        toast({
          title: "Limite atingido",
          description: "O Time B já possui 7 jogadores.",
          variant: "destructive",
        });
        return prev;
      }

      return {
        ...prev,
        teamB: [...prev.teamB, playerId],
        teamA: prev.teamA.filter((id) => id !== playerId),
      };
    });
  };

  const clearLineup = () => {
    setLineup((prev) => ({
      ...prev,
      teamA: [],
      teamB: [],
    }));
  };

  /* ===== MAPA PARA CANVAS (1 GK POR TIME) ===== */

  const mapPlayers = (ids: string[]) => {
    const mapped = ids.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[];

    let goalkeeperUsed = false;

    return mapped.map((p) => {
      let role: "GK" | "LINE" = "LINE";

      if (p.position === "goalkeeper" && !goalkeeperUsed) {
        role = "GK";
        goalkeeperUsed = true;
      }

      return {
        name: p.name,
        number: String(p.numero_camisa),
        role,
      };
    });
  };

  const teamA = mapPlayers(lineup.teamA);
  const teamB = mapPlayers(lineup.teamB);

  /* ===== CANVAS ===== */

  useEffect(() => {
    renderCanvas();
  }, [teamA, teamB, lineup.date]);

  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const base = await loadImage("/lineup-base.png");
    ctx.drawImage(base, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawDate(ctx, lineup.date);

    const shirtBlue = await loadImage("/shirt-blue.png");
    const shirtRed = await loadImage("/shirt-red.png");
    const shirtWhite = await loadImage("/shirt-white.png");
    const shirtBlack = await loadImage("/shirt-black.png");

    renderTeam(ctx, teamA, shirtRed, shirtBlue, teamA.length === 7 ? positionsTimeA_7 : positionsTimeA_6);
    renderTeam(ctx, teamB, shirtWhite, shirtBlack, teamB.length === 7 ? positionsTimeB_7 : positionsTimeB_6);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activePlayers = players.filter((p) => p.active);

  return (
    <div className="space-y-6 pt-4">
      {/* FAIXA FIXA */}
      <div className="sticky top-0 z-20 bg-background border-b border-border pb-4 mb-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold">Escalação</h1>
          <p className="text-sm text-muted-foreground">Selecione os jogadores e veja a escalação em tempo real</p>
        </div>

        {isAdmin && (
          <div className="max-w-xs">
            <Label>Data do jogo</Label>
            <Input type="date" value={lineup.date} onChange={(e) => setLineup({ ...lineup, date: e.target.value })} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div className="font-semibold text-primary">Time A: {lineup.teamA.length}</div>
            <div className="font-semibold text-warning">Time B: {lineup.teamB.length}</div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearLineup}
            disabled={lineup.teamA.length === 0 && lineup.teamB.length === 0}
          >
            Limpar seleção
          </Button>
        </div>
      </div>

      {/* SELECIONADOR */}
      <div className="space-y-2 max-w-xl">
        {activePlayers.map((player) => {
          const inA = lineup.teamA.includes(player.id);
          const inB = lineup.teamB.includes(player.id);

          return (
            <div
              key={player.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                inA && "bg-primary/20 border-primary",
                inB && "bg-warning/20 border-warning",
                !inA && !inB && "bg-muted/50 border-border",
              )}
            >
              <span className="flex-1 text-sm font-medium truncate">{player.name}</span>

              <div className="flex gap-2">
                <Button size="sm" variant={inA ? "default" : "outline"} onClick={() => togglePlayer(player.id, "A")}>
                  A
                </Button>
                <Button
                  size="sm"
                  variant={inB ? "secondary" : "outline"}
                  className={inB ? "bg-warning text-warning-foreground" : ""}
                  onClick={() => togglePlayer(player.id, "B")}
                >
                  B
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CANVAS */}
      <div className="flex justify-center pt-6">
        <canvas ref={canvasRef} className="max-w-full h-auto rounded-md border" style={{ maxHeight: "80vh" }} />
      </div>

      <Button onClick={downloadImage} className="mx-auto">
        Baixar Imagem
      </Button>
    </div>
  );
}

/* ================= HELPERS ================= */

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function drawDate(ctx: CanvasRenderingContext2D, isoDate: string) {
  const date = parseLocalDate(isoDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";

  // 🔥 DIA (MAIOR)
  ctx.font = "bold 100px Now, Arial";
  ctx.fillText(day, DATE_POSITION.x, DATE_POSITION.y);

  // 🔥 MÊS (MESMA FONTE, MENOR)
  ctx.font = "bold 52px Now, Arial";
  ctx.fillText(month, DATE_POSITION.x, DATE_POSITION.y + 78);
}

function renderTeam(
  ctx: CanvasRenderingContext2D,
  players: { name: string; number: string; role: "GK" | "LINE" }[],
  shirtGK: HTMLImageElement,
  shirtLine: HTMLImageElement,
  layout: { x: number; y: number }[],
) {
  const safePlayers = players.slice(0, layout.length);
  const gk = safePlayers.find((p) => p.role === "GK");
  const line = safePlayers.filter((p) => p.role !== "GK");

  if (gk) drawPlayer(ctx, shirtGK, gk.name, gk.number, layout[0]);

  line.forEach((p, i) => {
    if (!layout[i + 1]) return;
    drawPlayer(ctx, shirtLine, p.name, p.number, layout[i + 1]);
  });
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  shirt: HTMLImageElement,
  name: string,
  number: string,
  pos: { x: number; y: number },
) {
  const cx = pos.x + OFFSET_X;
  const cy = pos.y + OFFSET_Y;

  ctx.drawImage(shirt, cx - SHIRT_SIZE / 2, cy - SHIRT_SIZE / 2, SHIRT_SIZE, SHIRT_SIZE);

  ctx.textAlign = "center";
  ctx.fillStyle = shirt.src.includes("shirt-white") ? "#000" : "#FFF";

  ctx.font = "bold 16px Now, Arial";
  ctx.fillText(name.toUpperCase(), cx, cy - 40);

  ctx.font = "bold 58px Now, Arial";
  ctx.fillText(number, cx, cy + 20);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

function downloadImage() {
  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = "escalacao.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
