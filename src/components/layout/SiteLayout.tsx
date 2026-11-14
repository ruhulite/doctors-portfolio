import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
export function SiteLayout(){return <div className="relative min-h-screen bg-white text-ink"><a href="#main-content" className="skip-link">Skip to content</a><Header/><main id="main-content"><Outlet/></main><Footer/></div>}
