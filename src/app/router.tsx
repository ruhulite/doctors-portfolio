import { createBrowserRouter } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { HomePage } from "../pages/HomePage";
import { AboutPage } from "../pages/AboutPage";
import { ChambersPage } from "../pages/ChambersPage";
import { AppointmentPage } from "../pages/AppointmentPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AdminPage } from "../pages/AdminPage";

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/chambers", element: <ChambersPage /> },
      { path: "/appointment", element: <AppointmentPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);