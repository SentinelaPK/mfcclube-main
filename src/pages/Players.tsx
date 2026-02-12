import { useState } from "react";
import { Plus, Search, UserCheck, UserX, Shield, Footprints, Loader2, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Player, positionLabels, membershipLabels } from "@/data/types";
import { cn } from "@/lib/utils";
import { usePlayers, useAddPlayer, useUpdatePlayer, useDeletePlayer } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

const Players = () => {
  const { data: players = [], isLoading } = usePlayers();
  const { matches } = useMatches();
  const addPlayerMutation = useAddPlayer();
  const updatePlayerMutation = useUpdatePlayer();
  const deletePlayerMutation = useDeletePlayer();
  const { isAdmin } = useUserRole();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const [newPlayer, setNewPlayer] = useState<any>({
    name: "",
    membershipType: "monthly" as Player["membershipType"],
    position: "field" as Player["position"],
    active: true,
    numero_camisa: 0,
    celular: "",
    data_nascimento: "",
  });

  const filteredPlayers = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    // Active first, then by membership type, then alphabetically
    if (a.active !== b.active) return a.active ? -1 : 1;
    if (a.membershipType !== b.membershipType) return a.membershipType === "monthly" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  // Check if player has any match history
  const playerHasMatches = (playerId: string): boolean => {
    return matches.some((match) => match.teamA.includes(playerId) || match.teamB.includes(playerId));
  };

  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) {
      toast.error("Informe o nome do jogador");
      return;
    }

    const playerToSend = {
      ...newPlayer,
      numero_camisa: newPlayer.numero_camisa === 0 ? null : newPlayer.numero_camisa,
    };

    addPlayerMutation.mutate(playerToSend, {
      onSuccess: () => {
        setNewPlayer({
          name: "",
          membershipType: "monthly",
          position: "field",
          active: true,
          numero_camisa: 0,
          celular: "",
          data_nascimento: "",
        });
        setDialogOpen(false);
      },
    });
  };

  const toggleActive = (playerId: string, currentActive: boolean) => {
    updatePlayerMutation.mutate({ id: playerId, active: !currentActive });
  };

  const handleDeleteClick = (player: Player) => {
    setPlayerToDelete(player);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!playerToDelete) return;

    const hasMatches = playerHasMatches(playerToDelete.id);
    deletePlayerMutation.mutate(
      { id: playerToDelete.id, hasMatches },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPlayerToDelete(null);
        },
      },
    );
  };

  const handleEditClick = (player: Player) => {
    setEditingPlayer({ ...player });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingPlayer) return;

    updatePlayerMutation.mutate(
      {
        id: editingPlayer.id,
        name: editingPlayer.name,
        membershipType: editingPlayer.membershipType,
        position: editingPlayer.position,
        active: editingPlayer.active,
        numero_camisa:
          editingPlayer.numero_camisa === 0 || editingPlayer.numero_camisa == null ? null : editingPlayer.numero_camisa,
        celular: editingPlayer.celular,
        data_nascimento: editingPlayer.data_nascimento,
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingPlayer(null);
        },
      },
    );
  };

  const activeCount = players.filter((p) => p.active).length;
  const monthlyCount = players.filter((p) => p.membershipType === "monthly").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Jogadores</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} ativos · {monthlyCount} mensalistas
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo
              </Button>
            </DialogTrigger>

            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Novo Jogador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do jogador"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número da Camisa</Label>
                  <Input
                    type="number"
                    value={newPlayer.numero_camisa}
                    onChange={(e) => setNewPlayer({ ...newPlayer, numero_camisa: Number(e.target.value) })}
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Celular</Label>
                  <Input
                    type="tel"
                    placeholder="11999999999"
                    value={newPlayer.celular}
                    onChange={(e) => setNewPlayer({ ...newPlayer, celular: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={newPlayer.data_nascimento}
                    onChange={(e) => setNewPlayer({ ...newPlayer, data_nascimento: e.target.value })}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Sócio</Label>
                  <Select
                    value={newPlayer.membershipType}
                    onValueChange={(v) => setNewPlayer({ ...newPlayer, membershipType: v as Player["membershipType"] })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensalista</SelectItem>
                      <SelectItem value="guest">Convidado</SelectItem>
                      <SelectItem value="supporter">Sócio-torcedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Posição</Label>
                  <Select
                    value={newPlayer.position}
                    onValueChange={(v) => setNewPlayer({ ...newPlayer, position: v as Player["position"] })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalkeeper">Goleiro</SelectItem>
                      <SelectItem value="field">Linha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Ativo</Label>
                  <Switch
                    id="active"
                    checked={newPlayer.active}
                    onCheckedChange={(checked) => setNewPlayer({ ...newPlayer, active: checked })}
                  />
                </div>
                <Button onClick={handleAddPlayer} className="w-full" disabled={addPlayerMutation.isPending}>
                  {addPlayerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Adicionar Jogador
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const hasMatches = playerHasMatches(player.id);
          return (
            <Card
              key={player.id}
              className={cn("glass-card transition-all duration-300", !player.active && "opacity-60")}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      player.position === "goalkeeper" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary",
                    )}
                  >
                    {player.position === "goalkeeper" ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <Footprints className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{player.name}</h3>
                      {player.active ? (
                        <UserCheck className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <UserX className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={player.membershipType === "monthly" ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0"
                      >
                        {membershipLabels[player.membershipType]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{positionLabels[player.position]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => handleEditClick(player)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(player)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Switch
                      checked={player.active}
                      onCheckedChange={() => toggleActive(player.id, player.active)}
                      disabled={updatePlayerMutation.isPending || !isAdmin}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">Nenhum jogador encontrado</div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Jogador</AlertDialogTitle>
            <AlertDialogDescription>
              {playerToDelete && playerHasMatches(playerToDelete.id) ? (
                <>
                  <span className="font-medium text-warning">{playerToDelete.name}</span> possui histórico de partidas.
                  O jogador será removido das listas ativas, mas o histórico de partidas será preservado.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir{" "}
                  <span className="font-medium text-foreground">{playerToDelete?.name}</span>? Esta ação não pode ser
                  desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePlayerMutation.isPending}
            >
              {deletePlayerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {playerToDelete && playerHasMatches(playerToDelete.id) ? "Remover" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Player Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Jogador</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  placeholder="Nome do jogador"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Número da Camisa</Label>
                <Input
                  type="number"
                  value={editingPlayer.numero_camisa ?? ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, numero_camisa: Number(e.target.value) })}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Celular</Label>
                <Input
                  type="tel"
                  value={editingPlayer.celular ?? ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, celular: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={editingPlayer.data_nascimento ?? ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, data_nascimento: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Sócio</Label>
                <Select
                  value={editingPlayer.membershipType}
                  onValueChange={(v) =>
                    setEditingPlayer({ ...editingPlayer, membershipType: v as Player["membershipType"] })
                  }
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensalista</SelectItem>
                    <SelectItem value="guest">Convidado</SelectItem>
                    <SelectItem value="supporter">Sócio-torcedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Posição</Label>
                <Select
                  value={editingPlayer.position}
                  onValueChange={(v) => setEditingPlayer({ ...editingPlayer, position: v as Player["position"] })}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goalkeeper">Goleiro</SelectItem>
                    <SelectItem value="field">Linha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active">Ativo</Label>
                <Switch
                  id="edit-active"
                  checked={editingPlayer.active}
                  onCheckedChange={(checked) => setEditingPlayer({ ...editingPlayer, active: checked })}
                />
              </div>
              <Button
                onClick={handleSaveEdit}
                className="w-full"
                disabled={updatePlayerMutation.isPending || !editingPlayer.name.trim()}
              >
                {updatePlayerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Players;
