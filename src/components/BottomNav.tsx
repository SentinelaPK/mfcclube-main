import { NavLink } from "react-router-dom";
import { 
  Home, 
  Users, 
  Trophy, 
  Swords, 
  AlertTriangle, 
  Wallet,
  ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Início" },
  { to: "/players", icon: Users, label: "Jogadores" },
  { to: "/matches", icon: Swords, label: "Partidas" },
  { to: "/escalacao", icon: ScrollText, label: "Escalação" },
  { to: "/ranking", icon: Trophy, label: "Ranking" },
  { to: "/cashflow", icon: Wallet, label: "Caixa" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50">
      <div className="flex items-center justify-around h-[var(--nav-height)] px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive && "bg-primary/20 shadow-glow"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
