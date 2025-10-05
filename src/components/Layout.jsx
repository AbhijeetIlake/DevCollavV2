import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import './Layout.css';

function Layout() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">DevCollab</h1>
          <p className="logo-subtitle">Collaborative Coding</p>
        </div>

        <nav className="nav">
          <Link to="/" className={location.pathname === '/' ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/snippets" className={location.pathname === '/snippets' ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📝</span>
            <span>Snippets</span>
          </Link>
          <Link to="/workspaces" className={location.pathname === '/workspaces' ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">💼</span>
            <span>Workspaces</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="user-details">
              <p className="user-name">{user?.fullName || user?.username}</p>
              <p className="user-email">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
