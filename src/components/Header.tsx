import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!user?.email) return "??";
    const email = user.email;
    const name = email.split("@")[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            alt="MFC Logo"
            className="w-10 h-10 object-contain"
            src="/lovable-uploads/cb5c6517-398a-42c1-b78b-146e3b2f7b05.jpg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">
              MENTIRA FC
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              Gestão do Clube
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {getUserInitials()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;