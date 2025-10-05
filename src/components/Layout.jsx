import { Outlet, Link, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import "./Layout.css";

const NavItem = ({ to, icon, children }) => {
  const location = useLocation();

  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to + "/"));

  const finalIsActive = to === "/" ? location.pathname === "/" : isActive;

  return (
    <Link to={to} className={`nav-item ${finalIsActive ? "active" : ""}`}>
      <span className="nav-icon">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

function Layout() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="layout-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  const userName =
    user?.fullName || user?.username || (isSignedIn ? "User" : "Guest");
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    (isSignedIn ? "No email" : "Sign in");

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img
              src="/tabLogo2.png"
              alt="Logo"
              className="sidebar-logo"
              height={40}
              width={40}
            />
            <h1 className="logo">DevCollab</h1>
          </div>
          <p className="logo-subtitle">Collaborative Coding</p>
        </div>

        <nav className="nav">
          <NavItem to="/" icon="📈">
            Dashboard
          </NavItem>
          <NavItem to="/snippets" icon="📝">
            Snippets
          </NavItem>
          <NavItem to="/workspaces" icon="💼">
            Workspaces
          </NavItem>
        </nav>

        <div className="sidebar-footer">
          {isSignedIn ? (
            <div className="user-info">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: { userButtonAvatarBox: "clerk-avatar-box" },
                }}
              />
              <div className="user-details">
                <p className="user-name">{userName}</p>
                <p className="user-email">{userEmail}</p>
              </div>
            </div>
          ) : (
            <Link to="/sign-in" className="sign-in-cta">
              <span className="sign-in-icon">➡️</span>
              Sign In / Sign Up
            </Link>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
