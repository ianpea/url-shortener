import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {TooltipProvider} from './components/ui/tooltip.tsx';
import {ThemeProvider} from './components/theme-provider.tsx';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from './components/ui/toast.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </ThemeProvider>

    </QueryClientProvider>

    <Toaster />
  </StrictMode>,
);
