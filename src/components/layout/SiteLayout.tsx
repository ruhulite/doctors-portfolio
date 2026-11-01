import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout() {
  return <div className="min-h-screen bg-canvas text-ink">
    <div className="bg-deep py-2 text-center text-xs text-white">Digestive Health · Liver · Pancreas <span className="mx-2 text-white/40">|</span> Dhaka, Bangladesh</div>
    <Header />
    <main><Outlet /></main>
    <Footer />
    <a href="/appointment" className="fixed inset-x-4 bottom-3 z-40 rounded-full bg-deep px-5 py-3 text-center text-sm font-semibold text-white shadow-xl md:hidden">Book appointment / অ্যাপয়েন্টমেন্ট</a>
  </div>;
}