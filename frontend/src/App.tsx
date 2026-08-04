import { Toaster } from 'sonner';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Intro from "@/pages/Intro";
import Home from "@/pages/Home";
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <Toaster position='bottom-right'/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>

    </>
  )
}

export default App