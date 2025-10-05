import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Snippets from './pages/Snippets';
import Workspaces from './pages/Workspaces';
import WorkspaceEditor from './pages/WorkspaceEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in/*" element={
          <div className="auth-container">
            <SignIn routing="path" path="/sign-in" />
          </div>
        } />
        <Route path="/sign-up/*" element={
          <div className="auth-container">
            <SignUp routing="path" path="/sign-up" />
          </div>
        } />

        <Route path="/" element={
          <>
            <SignedIn>
              <Layout />
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" replace />
            </SignedOut>
          </>
        }>
          <Route index element={<Dashboard />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="workspace/:workspaceId" element={<WorkspaceEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
