import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Workspaces.css';

const API_BASE = import.meta.env.VITE_API_URL; 

function Workspaces() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (user) fetchWorkspaces();
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/workspaces?userId=${user.id}`);
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/workspaces`, {
        ...formData,
        ownerId: user.id,
        ownerName: user.fullName || user.username
      });
      fetchWorkspaces();
      closeModal();
      navigate(`/workspace/${response.data.workspaceId}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    try {
      // Extract workspaceId from the link
      const match = inviteLink.match(/\/workspace\/([a-f0-9-]+)/i);
      if (!match) throw new Error('Invalid workspace link');

      const workspaceId = match[1];

      // Call backend to add collaborator
      await axios.post(`${API_BASE}/api/workspaces/${workspaceId}/collaborators`, {
        userId: user.id,
        username: user.fullName || user.username
      });

      // Refresh list and navigate to the workspace
      fetchWorkspaces();
      setShowJoinModal(false);
      setInviteLink('');
      alert('Successfully joined the workspace!');
      navigate(`/workspace/${workspaceId}`);
    } catch (error) {
      console.error('Error joining workspace:', error);
      alert(error.response?.data?.error || error.message);
    }
  };

  const handleDelete = async (workspaceId, ownerId) => {
    if (ownerId !== user.id) {
      alert('Only the workspace owner can delete this workspace');
      return;
    }
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await axios.delete(`${API_BASE}/api/workspaces/${workspaceId}?userId=${user.id}`);
        fetchWorkspaces();
      } catch (error) {
        console.error('Error deleting workspace:', error);
        alert(error.response?.data?.error || 'Error deleting workspace');
      }
    }
  };

  const openModal = () => {
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  const openJoinModal = () => setShowJoinModal(true);
  const closeJoinModal = () => { setShowJoinModal(false); setInviteLink(''); };
  const openWorkspace = (workspaceId) => navigate(`/workspace/${workspaceId}`);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading workspaces...</p>
    </div>
  );

  return (
    <div className="workspaces-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Collaborate with your team in real-time</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openModal}>+ New Workspace</button>
          <button className="btn btn-secondary" onClick={openJoinModal}>🔗 Join Workspace</button>
        </div>
      </div>

      <div className="workspaces-grid">
        {workspaces.length === 0 ? (
          <div className="empty-state">
            <p>No workspaces yet</p>
            <button className="btn btn-primary" onClick={openModal}>
              Create your first workspace
            </button>
          </div>
        ) : (
          workspaces.map(ws => (
            <div key={ws._id} className="workspace-card">
              <div className="workspace-header">
                <h3 className="workspace-title">{ws.name}</h3>
                <span className={`badge ${ws.ownerId === user.id ? 'badge-primary' : 'badge-secondary'}`}>
                  {ws.ownerId === user.id ? '👑 Owner' : '🤝 Collaborator'}
                </span>
              </div>
              {ws.description && <p className="workspace-description">{ws.description}</p>}
              <div className="workspace-meta">
                <div className="workspace-info">
                  <span className="workspace-stat">👥 {ws.collaborators.length + 1} members</span>
                  <span className="workspace-stat">📝 {ws.snippets.length} snippets</span>
                </div>
                <span className="workspace-date">{new Date(ws.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="workspace-actions">
                <button className="btn btn-primary" onClick={() => openWorkspace(ws.workspaceId)}>Open</button>
                {ws.ownerId === user.id && (
                  <button className="btn btn-danger" onClick={() => handleDelete(ws.workspaceId, ws.ownerId)}>Delete</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Create New Workspace</h2></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Workspace Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this workspace about?"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={closeJoinModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2 className="modal-title">Join Workspace</h2></div>
            <form onSubmit={handleJoinWorkspace}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Workspace Link</label>
                  <input
                    type="text"
                    className="input"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    placeholder="Paste the workspace invite link here"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeJoinModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Join Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspaces;
