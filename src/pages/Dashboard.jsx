import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import { AiFillSnippets } from "react-icons/ai";
import { FaLock, FaLockOpen, FaCrown } from "react-icons/fa";
import { BsPersonWorkspace } from "react-icons/bs";
import { FcCollaboration } from "react-icons/fc";

const API_BASE = import.meta.env.VITE_API_URL;

const StatCard = ({ icon, iconClass, value, label }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconClass}`}>{icon}</div>
    <div className="stat-content">
      <h3 className="stat-value">{value || 0}</h3>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

const EmptyState = ({ message, linkTo, ctaText }) => (
  <div className="empty-state">
    <p>{message}</p>
    <Link to={linkTo} className="btn btn-primary">
      {ctaText}
    </Link>
  </div>
);

function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Component State
  const [stats, setStats] = useState(null);
  const [recentSnippets, setRecentSnippets] = useState([]);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchDashboardData = useCallback(async (userId) => {
    setIsLoadingData(true);
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard`, {
        params: { userId },
      });
      setStats(response.data.stats);
      setRecentSnippets(response.data.recentSnippets);
      setRecentWorkspaces(response.data.recentWorkspaces);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn && user?.id) {
      fetchDashboardData(user.id);
    } else if (isLoaded && !isSignedIn) {
      setIsLoadingData(false);
    }
  }, [isLoaded, isSignedIn, user?.id, fetchDashboardData]);

  if (!isLoaded || isLoadingData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>
          {!isLoaded ? "Authenticating user..." : "Loading dashboard data..."}
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="dashboard-error loading-container">
        <h1 className="page-title">Access Denied 🛑</h1>
        <p className="page-subtitle">Please sign in to view your dashboard.</p>
        <Link to="/sign-in" className="btn btn-primary">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const displayName = user?.firstName || user?.username || "user";

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {displayName}!</h1>
          <p className="page-subtitle">Here's an overview of your activity</p>
        </div>
      </div>

      {/* Stats Grid Section */}
      <div className="stats-grid">
        <StatCard
          icon={<AiFillSnippets />}
          iconClass="stat-icon-primary"
          value={stats?.totalSnippets}
          label="Total Snippets"
        />
        <StatCard
          icon={<FaLockOpen />}
          iconClass="stat-icon-success"
          value={stats?.publicSnippets}
          label="Public Snippets"
        />
        <StatCard
          icon={<FaLock />}
          iconClass="stat-icon-warning"
          value={stats?.privateSnippets}
          label="Private Snippets"
        />
        <StatCard
          icon={<BsPersonWorkspace />}
          iconClass="stat-icon-info"
          value={stats?.totalWorkspaces}
          label="Total Workspaces"
        />
        <StatCard
          icon={<FaCrown />}
          iconClass="stat-icon-primary"
          value={stats?.ownedWorkspaces}
          label="Owned Workspaces"
        />
        <StatCard
          icon={<FcCollaboration />}
          iconClass="stat-icon-secondary"
          value={stats?.collaboratingWorkspaces}
          label="Collaborating"
        />
      </div>

      {/* Content Section: Recent Snippets & Workspaces */}
      <div className="dashboard-content">
        {/* Recent Snippets Section */}
        <div className="recent-section">
          <div className="section-header">
            <h2 className="section-title">
              Recent Snippets <AiFillSnippets />
            </h2>
            <Link to="/snippets" className="section-link">
              View all →
            </Link>
          </div>
          <div className="recent-list">
            {recentSnippets.length === 0 ? (
              <EmptyState
                message="Time to save some code! Create your first snippet."
                linkTo="/snippets/new"
                ctaText="Create Snippet"
              />
            ) : (
              recentSnippets.map((snippet) => (
                // FIX: Link should go to the individual snippet page
                <Link
                  key={snippet._id}
                  to={`/snippets/${snippet._id}`}
                  className="recent-item"
                >
                  <div className="recent-item-content">
                    <h3 className="recent-item-title">{snippet.title}</h3>
                    <p className="recent-item-meta">
                      {snippet.language} &bull;{" "}
                      {snippet.isPublic ? "🔓 Public" : "🔒 Private"}
                    </p>
                  </div>
                  <span className="recent-item-date">
                    {new Date(snippet.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Workspaces Section */}
        <div className="recent-section">
          <div className="section-header">
            <h2 className="section-title">
              Recent Workspaces {<BsPersonWorkspace />}{" "}
            </h2>
            <Link to="/workspaces" className="section-link">
              View all →
            </Link>
          </div>
          <div className="recent-list">
            {recentWorkspaces.length === 0 ? (
              <EmptyState
                message="Start collaborating! Create or join a workspace."
                linkTo="/workspaces/new"
                ctaText="Create Workspace"
              />
            ) : (
              recentWorkspaces.map((workspace) => (
                <Link
                  key={workspace._id}
                  to={`/workspace/${workspace.workspaceId}`}
                  className="recent-item"
                >
                  <div className="recent-item-content">
                    <h3 className="recent-item-title">{workspace.name}</h3>
                    <p className="recent-item-meta">
                      {workspace.ownerId === user.id
                        ? "👑 Owner"
                        : "🤝 Collaborator"}{" "}
                      &bull; {workspace.collaborators.length} members
                    </p>
                  </div>
                  <span className="recent-item-date">
                    {new Date(workspace.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
