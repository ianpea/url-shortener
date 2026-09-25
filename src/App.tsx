import Header from './components/header';
import './App.css';
import Footer from './components/footer';
import {Separator} from './components/ui/separator';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from './pages/home-page';
import {RedirectPage} from './pages/redirect-page';

function App() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-40 size-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[28rem] rounded-full bg-accent/70 blur-3xl" />
        <div className="app-grid absolute inset-0 opacity-35 dark:opacity-15" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <Header />
        <Separator className="mt-6 opacity-60" />

        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/:shortCode' element={<RedirectPage />}></Route>
          </Routes>
        </BrowserRouter>

        <Separator className="mb-5 opacity-60" />
        <Footer />
      </div>
    </main>
  );
}

export default App;
