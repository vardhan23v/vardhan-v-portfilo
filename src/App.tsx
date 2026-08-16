import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from "./landing/Landing";
import { ClassicSite } from "./classic/ClassicSite";
import { TerminalLayout } from "./terminal/TerminalLayout";
import { TerminalHome } from "./terminal/TerminalHome";
import { WorkDetail } from "./terminal/components/WorkDetail";
import { PaperSite } from "./paper/PaperSite";
import { AuroraSite } from "./aurora/AuroraSite";
import "./landing/Landing.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/classic" element={<ClassicSite />} />
        <Route path="/paper" element={<PaperSite />} />
        <Route path="/aurora" element={<AuroraSite />} />
        <Route path="/terminal" element={<TerminalLayout />}>
          <Route index element={<TerminalHome />} />
          <Route path="work/:slug" element={<WorkDetail />} />
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}