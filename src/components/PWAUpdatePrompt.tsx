import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5" />
        <span className="text-sm font-medium">Nova versão disponível!</span>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={close}
        >
          Depois
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => updateServiceWorker(true)}
          className="bg-white text-primary hover:bg-gray-100"
        >
          Atualizar
        </Button>
      </div>
    </div>
  );
};
