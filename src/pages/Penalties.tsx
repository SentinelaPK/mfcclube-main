import { useState } from "react";
import { Plus, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlayers } from "@/hooks/usePlayers";
import { usePenalties, useAddPenalty, useDeletePenalty } from "@/hooks/usePenalties";
import { useUserRole } from "@/hooks/useUserRole";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Penalty } from "@/data/types";
import { toast } from "sonner";

const Penalties = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: penalties = [], isLoading: penaltiesLoading } = usePenalties();
  const addPenalty = useAddPenalty();
  const deletePenalty = useDeletePenalty();
  const { isAdmin } = useUserRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [penaltyToDelete, setPenaltyToDelete] = useState<string | null>(null);
  const [newPenalty, setNewPenalty] = useState({
    date: new Date().toISOString().split("T")[0],
    playerId: "",
    value: -1 as Penalty["value"],
    reason: "",
  });

  const activePlayers = players.filter((p) => p.active);

  const getPlayerName = (id: string) => players.find((p) => p.id === id)?.name || "Desconhecido";

  const handleAddPenalty = async () => {
    if (!newPenalty.playerId) {
      toast.error("Selecione um jogador");
      return;
    }

    if (!newPenalty.reason.trim()) {
      toast.error("Informe o motivo da penalidade");
      return;
    }

    await addPenalty.mutateAsync({
      date: newPenalty.date,
      playerId: newPenalty.playerId,
      value: newPenalty.value,
      reason: newPenalty.reason,
    });

    setNewPenalty({
      date: new Date().toISOString().split("T")[0],
      playerId: "",
      value: -1,
      reason: "",
    });
    setDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setPenaltyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (penaltyToDelete) {
      await deletePenalty.mutateAsync(penaltyToDelete);
      setPenaltyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const totalPenalties = penalties.reduce((sum, p) => sum + Math.abs(p.value), 0);

  const isLoading = playersLoading || penaltiesLoading;

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
          <h1 className="text-xl font-bold text-foreground">Penalidades</h1>
          <p className="text-sm text-muted-foreground">
            {penalties.length} penalidades · -{totalPenalties} pontos
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova
              </Button>
            </DialogTrigger>

            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>Nova Penalidade</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newPenalty.date}
                    onChange={(e) => setNewPenalty({ ...newPenalty, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jogador</Label>
                  <Select
                    value={newPenalty.playerId}
                    onValueChange={(v) => setNewPenalty({ ...newPenalty, playerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Penalidade</Label>
                  <Select
                    value={String(newPenalty.value)}
                    onValueChange={(v) =>
                      setNewPenalty({
                        ...newPenalty,
                        value: parseInt(v) as Penalty["value"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">-1 ponto</SelectItem>
                      <SelectItem value="-2">-2 pontos</SelectItem>
                      <SelectItem value="-3">-3 pontos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Textarea
                    value={newPenalty.reason}
                    onChange={(e) => setNewPenalty({ ...newPenalty, reason: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleAddPenalty}
                  variant="destructive"
                  className="w-full"
                  disabled={addPenalty.isPending}
                >
                  {addPenalty.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Aplicar Penalidade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {penalties.map((penalty) => (
          <Card key={penalty.id} className="glass-card border-destructive/20">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <strong>{getPlayerName(penalty.playerId)}</strong>
                  <Badge variant="destructive">{penalty.value}</Badge>
                </div>

                <div className="text-sm text-muted-foreground">{penalty.reason}</div>

                <div className="text-[11px] text-muted-foreground italic">
                  {new Date(penalty.date).toLocaleDateString("pt-BR")}
                </div>
              </div>
              {isAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteClick(penalty.id)}
                  disabled={deletePenalty.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {penalties.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          Nenhuma penalidade registrada
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir penalidade"
        description="Tem certeza que deseja excluir esta penalidade? Os pontos serão restaurados ao jogador."
      />
    </div>
  );
};

export default Penalties;
