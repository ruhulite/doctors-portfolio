import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { HomePage } from "../pages/HomePage";
import { AdminPage } from "../pages/AdminPage";
import { NotFoundPage } from "../pages/NotFoundPage";
export const router = createBrowserRouter([{ element: <SiteLayout />, errorElement: <NotFoundPage />, children: [{ path: "/", element: <HomePage /> }, { path: "/admin", element: <AdminPage /> }, { path: "*", element: <NotFoundPage /> }] }]);
