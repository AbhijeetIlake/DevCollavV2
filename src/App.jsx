import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Root from "./components/Root";
import Dashboard from "./pages/Dashboard";
import Snippets from "./pages/Snippets";
import Workspaces from "./pages/Workspaces";
import WorkspaceEditor from "./pages/WorkspaceEditor";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/sign-in/*"
          element={
            <div className="auth-container">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="auth-container">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />

        {/* Root route: Landing (signed out) or protected layout + nested routes (signed in) */}
        <Route path="/" element={<Root />}>
          <Route index element={<Dashboard />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="workspace/:workspaceId" element={<WorkspaceEditor />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
