// src/pages/CashFlow.tsx
import { useState, useMemo, useRef } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar, Filter, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlayers } from "@/hooks/usePlayers";
import { useCashFlow, useAddCashEntry, useDeleteCashEntry } from "@/hooks/useCashFlow";
import { useUserRole } from "@/hooks/useUserRole";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { CashEntry, movementTypeLabels } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logoMFC from "@/assets/mfc-logo.png";

const NOME_TIME = "MFC Mentira Futebol Clube";
const LOGO_URL = "/pwa-512x512.png";

/* === Declarações para TypeScript reconhecer as libs do CDN === */
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}

function formatarMes(mes: string) {
  if (mes === "all") return "Selecione o mês";

  const [ano, mesNum] = mes.split("-");
  const data = new Date(Number(ano), Number(mesNum) - 1, 1);

  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default function CashFlow() {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: entries = [], isLoading: entriesLoading } = useCashFlow();
  const addCashEntry = useAddCashEntry();
  const deleteCashEntry = useDeleteCashEntry();
  const { isAdmin } = useUserRole();

  const pdfRef = useRef<HTMLDivElement>(null);

  const gerarPDF = async () => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem gerar o PDF.");
      return;
    }
    if (!window.jspdf) {
      toast.error("Biblioteca de PDF não carregou. Recarregue a página.");
      return;
    }
    if (!filteredEntries || filteredEntries.length === 0) {
      toast.error("Não há lançamentos para gerar o PDF.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    let y = 20;
    const line = 7;

    // Carregar logo
    let logoBase64: string | null = null;
    if (LOGO_URL) {
      const blob = await fetch(LOGO_URL).then((r) => r.blob());
      logoBase64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }

    if (logoBase64) {
      pdf.addImage(logoBase64, "PNG", 10, 8, 20, 20);
    }

    pdf.setFontSize(16);
    pdf.text(NOME_TIME, 105, 15, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("Relatório Mensal de Caixa", 105, 22, { align: "center" });

    y = 35;
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Entradas: R$ ${totalEntries.toFixed(2)}`, 10, y);
    y += line;
    pdf.text(`Saídas: R$ ${totalExits.toFixed(2)}`, 10, y);
    y += line;
    pdf.text(`Saldo: R$ ${balance.toFixed(2)}`, 10, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.text("Data", 10, y);
    pdf.text("Pessoa", 35, y);
    pdf.text("Tipo", 90, y);
    pdf.text("Movimento", 115, y);
    pdf.text("Valor", 165, y);
    y += 4;
    pdf.line(10, y, 200, y);
    y += 5;

    filteredEntries.forEach((e) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.setTextColor(0, 0, 0);
      pdf.text(new Date(e.date).toLocaleDateString("pt-BR"), 10, y);
      pdf.text(e.playerOrRecipient, 35, y, { maxWidth: 50 });
      pdf.text(e.type === "entry" ? "Entrada" : "Saída", 90, y);
      pdf.text(movementTypeLabels[e.movementType], 115, y, { maxWidth: 40 });

      if (e.type === "entry") {
        pdf.setTextColor(0, 150, 0);
        pdf.text(`+R$ ${e.amount.toFixed(2)}`, 165, y);
      } else {
        pdf.setTextColor(200, 0, 0);
        pdf.text(`-R$ ${e.amount.toFixed(2)}`, 165, y);
      }
      y += line;
    });

    pdf.setTextColor(0, 0, 0);
    pdf.save("relatorio-caixa.pdf");
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [mensalidadesOpen, setMensalidadesOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "entry" as CashEntry["type"],
    amount: 0,
    movementType: "monthly_fee" as CashEntry["movementType"],
    playerOrRecipient: "",
    comment: "",
  });

  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPlayer, setFilterPlayer] = useState<string>("all");
  const [mesMensalidade, setMesMensalidade] = useState<string>("all");

  const activePlayers = players.filter(
    (p) => p.active && (p.membershipType === "monthly" || p.membershipType === "supporter"),
  );
  const allActivePlayers = players.filter((p) => p.active);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    entries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  }, [entries]);

  const availablePlayers = useMemo(() => {
    const playersSet = new Set<string>();
    entries.forEach((entry) => playersSet.add(entry.playerOrRecipient));
    return Array.from(playersSet).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filterMonth !== "all") {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthKey !== filterMonth) return false;
      }
      if (filterType !== "all" && entry.type !== filterType) return false;
      if (filterPlayer !== "all" && entry.playerOrRecipient !== filterPlayer) return false;
      return true;
    });
  }, [entries, filterMonth, filterType, filterPlayer]);
  const mensalidadesDoMes = useMemo(() => {
    if (mesMensalidade === "all") return [];

    return entries.filter((e) => {
      if (e.movementType !== "monthly_fee") return false;
      if (e.type !== "entry") return false;

      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === mesMensalidade;
    });
  }, [entries, mesMensalidade]);
  const quemPagou = mensalidadesDoMes.map((e) => e.playerOrRecipient);

  const quemDeve =
  mesMensalidade === "all"
    ? []
    : activePlayers.map((p) => p.name).filter((nome) => !quemPagou.includes(nome));

  const summaryBase = filterMonth === "all" ? entries : filteredEntries;
  const totalEntries = summaryBase.filter((e) => e.type === "entry").reduce((s, e) => s + e.amount, 0);
  const totalExits = summaryBase.filter((e) => e.type === "exit").reduce((s, e) => s + e.amount, 0);
  const balance = totalEntries - totalExits;

     const marcarComoPago = async (nome: string) => {
  await addCashEntry.mutateAsync({
    date: new Date().toISOString().split("T")[0],
    type: "entry",
    amount: 50,
    movementType: "monthly_fee",
    playerOrRecipient: nome,
  });

  toast.success(`${nome} marcado como pago!`);
};
  const handleAddEntry = async () => {
    if (!newEntry.playerOrRecipient.trim()) return toast.error("Selecione um jogador ou destinatário");
    if (newEntry.amount <= 0) return toast.error("O valor deve ser maior que zero");

    await addCashEntry.mutateAsync({
      date: newEntry.date,
      type: newEntry.type,
      amount: newEntry.amount,
      movementType: newEntry.movementType,
      playerOrRecipient: newEntry.playerOrRecipient,
      comment: newEntry.comment || undefined,
    });

    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      type: "entry",
      amount: 0,
      movementType: "monthly_fee",
      playerOrRecipient: "",
      comment: "",
    });
    setDialogOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (entryToDelete) {
      await deleteCashEntry.mutateAsync(entryToDelete);
      setEntryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const groupedEntries = filteredEntries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      if (!acc[month]) acc[month] = [];
      acc[month].push(entry);
      return acc;
    },
    {} as Record<string, CashEntry[]>,
  );

  const isLoading = playersLoading || entriesLoading;
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-4 pt-4">
      {/* HEADER: título + Gerar PDF */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Caixa</h1>
          <p className="text-sm text-muted-foreground">Controle financeiro</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={gerarPDF}>
              Gerar PDF
            </Button>
          )}
        </div>
      </div>

      {/* NOVA LINHA DE AÇÕES: Mensalidades (esq) e + Novo (dir) */}
      <div className="flex items-center justify-between">
        {isAdmin && (
        <Dialog open={mensalidadesOpen} onOpenChange={setMensalidadesOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Mensalidades</Button>
          </DialogTrigger>

          <DialogContent className="glass-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mensalidades</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Aqui vamos escolher o mês e mostrar quem pagou e quem está devendo.
              </p>

              {/* Próximo passo: seletor de mês */}
              <div className="space-y-2">
                <Label>Mês</Label>

                <Select value={mesMensalidade} onValueChange={setMesMensalidade}>
                  <SelectTrigger>
  <SelectValue>
    {formatarMes(mesMensalidade)}
  </SelectValue>
</SelectTrigger>
                  <SelectContent>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Próximo passo: listas */}
              <div className="flex justify-between text-sm">
                <span>Pagaram: {quemPagou.length}</span>
                <span>Devendo: {quemDeve.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="glass-card">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium mb-2">Pagaram</p>
                    {quemPagou.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Ninguém pagou ainda</p>
                    ) : (
                      quemPagou.map((nome) => (
                        <p key={nome} className="text-sm">
                          {nome}
                        </p>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-3">
                    <p className="text-sm font-medium mb-2">Devendo</p>
                    {quemDeve.length === 0 ? (
  <p className="text-xs text-muted-foreground">Ninguém devendo</p>
) : (
  quemDeve.map((nome) => (
    <div key={nome} className="flex items-center justify-between text-sm">
      <span>{nome}</span>
           <Button
  size="icon"
  variant="outline"
  onClick={() => marcarComoPago(nome)}
  title="Marcar como pago"
>
  💰
</Button>
    </div>
  ))
)}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Novo
              </Button>
            </DialogTrigger>

            <DialogContent className="glass-card max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={newEntry.type === "entry" ? "default" : "outline"}
                      onClick={() => setNewEntry({ ...newEntry, type: "entry" })}
                      className={cn(newEntry.type === "entry" && "bg-success hover:bg-success/90")}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Entrada
                    </Button>
                    <Button
                      type="button"
                      variant={newEntry.type === "exit" ? "default" : "outline"}
                      onClick={() => setNewEntry({ ...newEntry, type: "exit" })}
                      className={cn(newEntry.type === "exit" && "bg-destructive hover:bg-destructive/90")}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Saída
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={newEntry.amount || ""}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={newEntry.movementType}
                    onValueChange={(v) =>
                      setNewEntry({
                        ...newEntry,
                        movementType: v as CashEntry["movementType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(movementTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{newEntry.type === "entry" ? "Jogador" : "Destinatário"}</Label>
                  {newEntry.type === "entry" ? (
                    <Select
                      value={newEntry.playerOrRecipient}
                      onValueChange={(v) =>
                        setNewEntry({
                          ...newEntry,
                          playerOrRecipient: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Outros">Outros</SelectItem>

                        {allActivePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.name}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={newEntry.playerOrRecipient}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          playerOrRecipient: e.target.value,
                        })
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Comentário</Label>
                  <Textarea
                    value={newEntry.comment}
                    onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddEntry} disabled={addCashEntry.isPending}>
                  {addCashEntry.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Registrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* SALDO E RESUMO */}
      <div ref={pdfRef} className="space-y-4">
        <Card className="glass-card">
          <CardContent className="p-6 flex items-center justify-center gap-3">
            <Wallet className="w-8 h-8" />
            <div className={cn("text-4xl font-bold", balance >= 0 ? "text-success" : "text-destructive")}>
              R$ {balance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center justify-center gap-2 text-success">
              <TrendingUp className="w-4 h-4" />
              <span>R$ {totalEntries.toFixed(2)}</span>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3 flex items-center justify-center gap-2 text-destructive">
              <TrendingDown className="w-4 h-4" />
              <span>R$ {totalExits.toFixed(2)}</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FILTROS (MOVIDOS PARA DEPOIS DO RESUMO) */}
      <Card className="glass-card">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>

            {(filterMonth !== "all" || filterType !== "all" || filterPlayer !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => {
                  setFilterMonth("all");
                  setFilterType("all");
                  setFilterPlayer("all");
                }}
              >
                Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entry">Entradas</SelectItem>
                <SelectItem value="exit">Saídas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlayer} onValueChange={setFilterPlayer}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Jogador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availablePlayers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* LISTA POR MÊS */}
      {Object.entries(groupedEntries).map(([month, monthEntries]) => (
        <div key={month} className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" /> <span className="capitalize">{month}</span>
          </div>
          {monthEntries.map((entry) => (
            <Card key={entry.id} className="glass-card">
              <CardContent className="p-3 flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    entry.type === "entry" ? "bg-success/20" : "bg-destructive/20",
                  )}
                >
                  {entry.type === "entry" ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{entry.playerOrRecipient}</h3>
                  {entry.comment && <p className="text-xs truncate">{entry.comment}</p>}
                  <p className="text-[10px]">{new Date(entry.date).toLocaleDateString("pt-BR")}</p>
                </div>

                <div className="flex flex-col items-end">
                  <Badge variant="secondary" className="text-[10px] mb-1">
                    {movementTypeLabels[entry.movementType]}
                  </Badge>
                  <div className={cn("font-bold", entry.type === "entry" ? "text-success" : "text-destructive")}>
                    {entry.type === "entry" ? "+" : "-"}R$ {entry.amount.toFixed(2)}
                  </div>
                </div>

                {isAdmin && (
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(entry.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir lançamento"
        description="Tem certeza que deseja excluir este lançamento?"
      />
    </div>
  );
}
