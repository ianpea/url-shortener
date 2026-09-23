import Header from './components/header';
import './App.css';
import Footer from './components/footer';
import {Separator} from './components/ui/separator';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomePage} from './pages/home-page';
import {RedirectPage} from './pages/redirect-page';

function App() {

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-6">
      <Header />

      <Separator />

      <BrowserRouter >
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/:shortCode' element={<RedirectPage />}></Route>
        </Routes>
      </BrowserRouter>
      <Separator />
      <Footer />
    </main>
  );
}

export default App;
