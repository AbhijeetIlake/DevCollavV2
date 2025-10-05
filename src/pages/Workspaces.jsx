import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Workspaces.css';

function Workspaces() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get(`/api/workspaces?userId=${user.id}`);
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
      const response = await axios.post('/api/workspaces', {
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

  const handleDelete = async (workspaceId, ownerId) => {
    if (ownerId !== user.id) {
      alert('Only the workspace owner can delete this workspace');
      return;
    }

    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/workspaces/${workspaceId}?userId=${user.id}`);
        fetchWorkspaces();
      } catch (error) {
        console.error('Error deleting workspace:', error);
        alert(error.response?.data?.error || 'Error deleting workspace');
      }
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      description: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openWorkspace = (workspaceId) => {
    navigate(`/workspace/${workspaceId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="workspaces-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspaces</h1>
          <p className="page-subtitle">Collaborate with your team in real-time</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + New Workspace
        </button>
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
          workspaces.map(workspace => (
            <div key={workspace._id} className="workspace-card">
              <div className="workspace-header">
                <h3 className="workspace-title">{workspace.name}</h3>
                <span className={`badge ${workspace.ownerId === user.id ? 'badge-primary' : 'badge-secondary'}`}>
                  {workspace.ownerId === user.id ? '👑 Owner' : '🤝 Collaborator'}
                </span>
              </div>
              {workspace.description && (
                <p className="workspace-description">{workspace.description}</p>
              )}
              <div className="workspace-meta">
                <div className="workspace-info">
                  <span className="workspace-stat">
                    👥 {workspace.collaborators.length + 1} members
                  </span>
                  <span className="workspace-stat">
                    📝 {workspace.snippets.length} snippets
                  </span>
                </div>
                <span className="workspace-date">
                  {new Date(workspace.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="workspace-actions">
                <button className="btn btn-primary" onClick={() => openWorkspace(workspace.workspaceId)}>
                  Open
                </button>
                {workspace.ownerId === user.id && (
                  <button className="btn btn-danger" onClick={() => handleDelete(workspace.workspaceId, workspace.ownerId)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Workspace</h2>
            </div>
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
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Workspaces;
