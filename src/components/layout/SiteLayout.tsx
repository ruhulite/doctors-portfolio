import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout() {
  return <div className="min-h-screen bg-white text-ink">
    <Header />
    <main><Outlet /></main>
    <Footer />
    <a href="/appointment" className="fixed inset-x-4 bottom-3 z-40 rounded-full bg-teal px-5 py-3 text-center text-sm font-semibold text-deep shadow-xl md:hidden">Book appointment / অ্যাপয়েন্টমেন্ট</a>
  </div>;
}
