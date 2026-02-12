import { Link } from "react-router-dom";
import { Users, Trophy, Swords, AlertTriangle, Wallet, ScrollText, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayers } from "@/hooks/usePlayers";
import { useMatches } from "@/hooks/useMatches";
import { useCashFlow } from "@/hooks/useCashFlow";
import { useRanking } from "@/hooks/useRanking";

const Dashboard = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { matches, isLoading: matchesLoading } = useMatches();
  const { data: cashEntries = [], isLoading: cashLoading } = useCashFlow();
  const { ranking, isLoading: rankingLoading } = useRanking();

  const isLoading = playersLoading || matchesLoading || cashLoading || rankingLoading;

  const activePlayers = players.filter(p => p.active).length;
  const totalMatches = matches.length;
  const topPlayer = ranking[0];
  
  const totalEntries = cashEntries.filter(c => c.type === "entry").reduce((sum, c) => sum + c.amount, 0);
  const totalExits = cashEntries.filter(c => c.type === "exit").reduce((sum, c) => sum + c.amount, 0);
  const balance = totalEntries - totalExits;

  const quickStats = [
    { label: "Jogadores Ativos", value: activePlayers, icon: Users, color: "text-primary" },
    { label: "Partidas", value: totalMatches, icon: Swords, color: "text-success" },
    { label: "Saldo", value: `R$ ${balance.toFixed(0)}`, icon: Wallet, color: balance >= 0 ? "text-success" : "text-destructive" },
  ];

  const menuItems = [
    { to: "/players", icon: Users, label: "Jogadores", description: "Gerenciar elenco", color: "bg-primary/20 text-primary" },
    { to: "/matches", icon: Swords, label: "Partidas", description: "Registrar jogos", color: "bg-success/20 text-success" },
    { to: "/ranking", icon: Trophy, label: "Ranking", description: "Classificação", color: "bg-warning/20 text-warning" },
    { to: "/penalties", icon: AlertTriangle, label: "Penalidades", description: "Punições", color: "bg-destructive/20 text-destructive" },
    { to: "/cashflow", icon: Wallet, label: "Caixa", description: "Finanças", color: "bg-primary/20 text-primary" },
    { to: "/rules", icon: ScrollText, label: "Regras", description: "Regulamento", color: "bg-muted text-muted-foreground" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-6">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <img alt="" className="w-full h-full object-contain" src="/lovable-uploads/cd6e153d-ada4-41e3-ad52-87829925c188.jpg" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Bem-vindo ao MFC
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Gestão completa do seu time
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Player Highlight */}
      {topPlayer && (
        <Card className="glass-card border-primary/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Líder do Ranking</p>
                <p className="text-lg font-bold text-foreground">{topPlayer.playerName}</p>
                <p className="text-sm text-primary font-semibold">{topPlayer.points} pontos</p>
              </div>
              <Link to="/ranking" className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                <ChevronRight className="w-5 h-5 text-primary" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item, index) => (
          <Link 
            key={item.to} 
            to={item.to} 
            className="animate-slide-up" 
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="glass-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow group">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
