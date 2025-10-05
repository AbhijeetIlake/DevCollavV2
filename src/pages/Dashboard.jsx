import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [recentSnippets, setRecentSnippets] = useState([]);
  const [recentWorkspaces, setRecentWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/api/dashboard?userId=${user.id}`);
      setStats(response.data.stats);
      setRecentSnippets(response.data.recentSnippets);
      setRecentWorkspaces(response.data.recentWorkspaces);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.firstName || user?.username}!</h1>
          <p className="page-subtitle">Here's an overview of your activity</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">📝</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.totalSnippets || 0}</h3>
            <p className="stat-label">Total Snippets</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">🔓</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.publicSnippets || 0}</h3>
            <p className="stat-label">Public Snippets</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">🔒</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.privateSnippets || 0}</h3>
            <p className="stat-label">Private Snippets</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">💼</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.totalWorkspaces || 0}</h3>
            <p className="stat-label">Total Workspaces</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">👑</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.ownedWorkspaces || 0}</h3>
            <p className="stat-label">Owned Workspaces</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-secondary">🤝</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats?.collaboratingWorkspaces || 0}</h3>
            <p className="stat-label">Collaborating</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Snippets</h2>
            <Link to="/snippets" className="section-link">View all →</Link>
          </div>
          <div className="recent-list">
            {recentSnippets.length === 0 ? (
              <div className="empty-state">
                <p>No snippets yet</p>
                <Link to="/snippets" className="btn btn-primary">Create your first snippet</Link>
              </div>
            ) : (
              recentSnippets.map(snippet => (
                <Link key={snippet._id} to="/snippets" className="recent-item">
                  <div className="recent-item-content">
                    <h3 className="recent-item-title">{snippet.title}</h3>
                    <p className="recent-item-meta">
                      {snippet.language} • {snippet.isPublic ? '🔓 Public' : '🔒 Private'}
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

        <div className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Workspaces</h2>
            <Link to="/workspaces" className="section-link">View all →</Link>
          </div>
          <div className="recent-list">
            {recentWorkspaces.length === 0 ? (
              <div className="empty-state">
                <p>No workspaces yet</p>
                <Link to="/workspaces" className="btn btn-primary">Create your first workspace</Link>
              </div>
            ) : (
              recentWorkspaces.map(workspace => (
                <Link key={workspace._id} to={`/workspace/${workspace.workspaceId}`} className="recent-item">
                  <div className="recent-item-content">
                    <h3 className="recent-item-title">{workspace.name}</h3>
                    <p className="recent-item-meta">
                      {workspace.ownerId === user.id ? '👑 Owner' : '🤝 Collaborator'} • {workspace.collaborators.length} members
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
