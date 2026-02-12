import { useState } from "react";
import { Plus, Calendar, Minus, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePlayers, useAllPlayers } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";
import { useUserRole } from "@/hooks/useUserRole";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Player } from "@/data/types";
import { cn } from "@/lib/utils";

const Matches = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: allPlayers = [], isLoading: allPlayersLoading } = useAllPlayers();
  const { matches, isLoading: matchesLoading, addMatch, deleteMatch } = useMatches();
  const { isAdmin } = useUserRole();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState({
    date: new Date().toISOString().split('T')[0],
    teamA: [] as string[],
    teamB: [] as string[],
    goalsTeamA: 0,
    goalsTeamB: 0,
  });

  const activePlayers = players.filter(p => p.active);

  // Sort players by priority
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    const priority = (p: Player) => {
      if (p.membershipType === "monthly" && p.position === "goalkeeper") return 0;
      if (p.membershipType === "monthly" && p.position === "field") return 1;
      if (p.membershipType === "guest" && p.position === "goalkeeper") return 2;
      return 3;
    };
    return priority(a) - priority(b);
  });

  const getPlayerName = (id: string) => 
    allPlayers.find(p => p.id === id)?.name || "Desconhecido";

  const togglePlayer = (playerId: string, team: "A" | "B") => {
    if (team === "A") {
      if (newMatch.teamA.includes(playerId)) {
        setNewMatch({ ...newMatch, teamA: newMatch.teamA.filter(id => id !== playerId) });
      } else {
        setNewMatch({ 
          ...newMatch, 
          teamA: [...newMatch.teamA, playerId],
          teamB: newMatch.teamB.filter(id => id !== playerId)
        });
      }
    } else {
      if (newMatch.teamB.includes(playerId)) {
        setNewMatch({ ...newMatch, teamB: newMatch.teamB.filter(id => id !== playerId) });
      } else {
        setNewMatch({ 
          ...newMatch, 
          teamB: [...newMatch.teamB, playerId],
          teamA: newMatch.teamA.filter(id => id !== playerId)
        });
      }
    }
  };

  const handleSaveMatch = async () => {
    await addMatch.mutateAsync({
      date: newMatch.date,
      teamA: newMatch.teamA,
      teamB: newMatch.teamB,
      goalsTeamA: newMatch.goalsTeamA,
      goalsTeamB: newMatch.goalsTeamB,
    });
    
    setNewMatch({
      date: new Date().toISOString().split('T')[0],
      teamA: [],
      teamB: [],
      goalsTeamA: 0,
      goalsTeamB: 0,
    });
    setDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setMatchToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (matchToDelete) {
      await deleteMatch.mutateAsync(matchToDelete);
      setMatchToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getMatchResult = (match: { goalsTeamA: number; goalsTeamB: number }) => {
    if (match.goalsTeamA > match.goalsTeamB) return { winner: "A", diff: match.goalsTeamA - match.goalsTeamB };
    if (match.goalsTeamB > match.goalsTeamA) return { winner: "B", diff: match.goalsTeamB - match.goalsTeamA };
    return { winner: "draw", diff: 0 };
  };

  const isLoading = playersLoading || matchesLoading || allPlayersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Partidas</h1>
          <p className="text-sm text-muted-foreground">{matches.length} jogos registrados</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Partida</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    Time A ({newMatch.teamA.length})
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewMatch({ ...newMatch, goalsTeamA: Math.max(0, newMatch.goalsTeamA - 1) })}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-2xl font-bold text-center flex-1">{newMatch.goalsTeamA}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewMatch({ ...newMatch, goalsTeamA: newMatch.goalsTeamA + 1 })}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    Time B ({newMatch.teamB.length})
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewMatch({ ...newMatch, goalsTeamB: Math.max(0, newMatch.goalsTeamB - 1) })}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-2xl font-bold text-center flex-1">{newMatch.goalsTeamB}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewMatch({ ...newMatch, goalsTeamB: newMatch.goalsTeamB + 1 })}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selecionar Jogadores</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {sortedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <span className="flex-1 text-sm truncate">{player.name}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={newMatch.teamA.includes(player.id) ? "default" : "outline"}
                          className="h-7 px-2 text-xs"
                          onClick={() => togglePlayer(player.id, "A")}
                        >
                          A
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={newMatch.teamB.includes(player.id) ? "secondary" : "outline"}
                          className={cn(
                            "h-7 px-2 text-xs",
                            newMatch.teamB.includes(player.id) && "bg-warning text-warning-foreground"
                          )}
                          onClick={() => togglePlayer(player.id, "B")}
                        >
                          B
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSaveMatch} 
                className="w-full"
                disabled={addMatch.isPending}
              >
                {addMatch.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Partida"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {matches.map((match, index) => {
          const result = getMatchResult(match);
          return (
            <Card
              key={match.id}
              className="glass-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(match.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.diff >= 5 && (
                      <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning">
                        Goleada!
                      </Badge>
                    )}
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleDeleteClick(match.id)}
                        disabled={deleteMatch.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Time A</span>
                    </div>
                    <div className={cn(
                      "text-3xl font-bold",
                      result.winner === "A" ? "text-success" : "text-foreground"
                    )}>
                      {match.goalsTeamA}
                    </div>
                  </div>
                  
                  <div className="text-lg font-bold text-muted-foreground">×</div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span className="text-xs text-muted-foreground">Time B</span>
                    </div>
                    <div className={cn(
                      "text-3xl font-bold",
                      result.winner === "B" ? "text-success" : "text-foreground"
                    )}>
                      {match.goalsTeamB}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground block mb-1">Time A:</span>
                      <div className="max-h-16 overflow-y-auto text-foreground space-y-0.5">
                        {match.teamA.map(id => (
                          <div key={id}>{getPlayerName(id)}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Time B:</span>
                      <div className="max-h-16 overflow-y-auto text-foreground space-y-0.5">
                        {match.teamB.map(id => (
                          <div key={id}>{getPlayerName(id)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma partida registrada
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir partida"
        description="Tem certeza que deseja excluir esta partida? O ranking será recalculado."
      />
    </div>
  );
};

export default Matches;
