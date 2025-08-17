import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Browse from "./components/Browse";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import DjangoJobs from "./components/DjangoJobs";
import Profile from "./components/Profile";
import Navbar from "./components/shared/Navbar";
import JobDescription from "./components/JobDescription";
import PageNotFound from "./components/PageNotFound";
import ErrorBoundary from "./components/ErrorBoundry";
// import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Companies from "./components/admin/Companies";
import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from "./components/admin/PostJob";
import Applicants from "./components/admin/Applicants";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// ______________
// < happy coding >
//  --------------
//   \
//    \
//        (\/)
//       (_o |
//        /  |
//        \  \______
//         \        )o
//          /|----- |
//          \|     /|

// ___________________________
// < deploy first, debug next >
//  ---------------------------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    ),
  },
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
  },
  {
    path: "/signup",
    element: (
      <ErrorBoundary>
        <Signup />
      </ErrorBoundary>
    ),
  },
  {
    path: "/jobs",
    element: (
      <ErrorBoundary>
        <Jobs />
      </ErrorBoundary>
    ),
  },
  {
    path: "/description/:id",
    element: (
      <ErrorBoundary>
        <JobDescription />
      </ErrorBoundary>
    ),
  },
  {
    path: "/browse",
    element: (
      <ErrorBoundary>
        <Browse />
      </ErrorBoundary>
    ),
  },
  {
    path: "/ai-jobs",
    element: (
      <ErrorBoundary>
        <DjangoJobs />
      </ErrorBoundary>
    ),
  },
  {
    path: "/profile",
    element: (
      <ErrorBoundary>
        <Profile />
      </ErrorBoundary>
    ),
  },
  {
    path: "*",
    element: (
      <ErrorBoundary>
        <PageNotFound />
      </ErrorBoundary>
    ),
  },
  // admin ke liye yha se start hoga

  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <Companies />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <CompanyCreate />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <CompanySetup />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <AdminJobs />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <PostJob />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <Applicants />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <ErrorBoundary>
        <RouterProvider router={appRouter} />
      </ErrorBoundary>
      {/* <RouterProvider router={appRouter} /> */}
    </>
  );
}

export default App;
