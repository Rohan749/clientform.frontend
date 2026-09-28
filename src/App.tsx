import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { FullPageSpinner } from "@/components/common/FullPageSpinner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GuestRoute, ProtectedRoute } from "@/components/layout/RouteGuards";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileProvider } from "@/context/ProfileContext";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CreateFormPage = lazy(() => import("@/pages/CreateFormPage"));
const FormsPage = lazy(() => import("@/pages/FormsPage"));
const SubmissionsPage = lazy(() => import("@/pages/SubmissionsPage"));
const SubmissionDetailPage = lazy(() => import("@/pages/SubmissionDetailPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const PublicFormPage = lazy(() => import("@/pages/PublicFormPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function Root() {
  return (
    <AuthProvider>
      <Suspense fallback={<FullPageSpinner />}>
        <Outlet />
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: "/signup", element: <GuestRoute><SignupPage /></GuestRoute> },

      // Public, client-facing form — no dashboard UI.
      { path: "/f/:slug", element: <PublicFormPage /> },

      {
        element: (
          <ProtectedRoute>
            <ProfileProvider>
              <DashboardLayout />
            </ProfileProvider>
          </ProtectedRoute>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/create-form", element: <CreateFormPage /> },
          { path: "/forms", element: <FormsPage /> },
          { path: "/forms/:id/edit", element: <CreateFormPage /> },
          { path: "/submissions", element: <SubmissionsPage /> },
          { path: "/submissions/:id", element: <SubmissionDetailPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
