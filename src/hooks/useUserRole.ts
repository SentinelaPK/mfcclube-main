import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      
      if (error) {
        // Log interno para debugging, não expor ao usuário
        console.error("[Role Check - Internal]:", error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user?.id,
  });

  return {
    isAdmin,
    isLoading: authLoading || roleLoading,
  };
};
