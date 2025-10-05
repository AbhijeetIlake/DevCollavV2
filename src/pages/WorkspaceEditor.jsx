import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './WorkspaceEditor.css';

function WorkspaceEditor() {
  const { workspaceId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [snippetTitle, setSnippetTitle] = useState('');
  const socketRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    fetchWorkspace();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-workspace', { workspaceId });
        socketRef.current.disconnect();
      }
    };
  }, [workspaceId, user]);

  const fetchWorkspace = async () => {
    try {
      const response = await axios.get(`/api/workspaces/${workspaceId}`);
      setWorkspace(response.data);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      alert('Workspace not found');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-workspace', {
        workspaceId,
        userId: user.id,
        username: user.fullName || user.username
      });
    });

    socketRef.current.on('users-update', (users) => {
      setConnectedUsers(users);
    });

    socketRef.current.on('content-update', (content) => {
      setCode(content);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        workspaceId,
        content: value || ''
      });
    }
  };

  const handleInviteCollaborator = async (e) => {
    e.preventDefault();
    alert('Invite functionality requires integration with user management. Share the workspace URL with your collaborator.');
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleSaveSnippet = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/workspaces/${workspaceId}/snippets`, {
        title: snippetTitle,
        code: code,
        language: language
      });
      fetchWorkspace();
      setShowSnippetModal(false);
      setSnippetTitle('');
      alert('Snippet saved to workspace!');
    } catch (error) {
      console.error('Error saving snippet:', error);
      alert('Error saving snippet');
    }
  };

  const handleLoadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await axios.delete(`/api/workspaces/${workspaceId}/snippets/${snippetId}`);
        fetchWorkspace();
      } catch (error) {
        console.error('Error deleting snippet:', error);
      }
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/workspace/${workspaceId}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  const isOwner = workspace.ownerId === user.id;

  return (
    <div className="workspace-editor">
      <div className="editor-header">
        <div className="header-left">
          <button className="btn btn-outline back-btn" onClick={() => navigate('/workspaces')}>
            ← Back
          </button>
          <div>
            <h1 className="workspace-name">{workspace.name}</h1>
            <p className="workspace-id">ID: {workspaceId}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="connected-users">
            <span className="users-label">Connected:</span>
            <div className="users-avatars">
              {connectedUsers.map((u, index) => (
                <div key={index} className="user-avatar" title={u.username}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleCopyInviteLink}>
            📋 Copy Invite Link
          </button>
          <button className="btn btn-primary" onClick={() => setShowSnippetModal(true)}>
            💾 Save Snippet
          </button>
        </div>
      </div>

      <div className="editor-container-main">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Language</h3>
            <select
              className="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Workspace Snippets</h3>
            <div className="snippets-list">
              {workspace.snippets.length === 0 ? (
                <p className="empty-text">No snippets saved</p>
              ) : (
                workspace.snippets.map(snippet => (
                  <div key={snippet._id} className="snippet-item">
                    <div className="snippet-item-content">
                      <h4 className="snippet-item-title">{snippet.title}</h4>
                      <span className="snippet-item-lang">{snippet.language}</span>
                    </div>
                    <div className="snippet-item-actions">
                      <button
                        className="icon-btn"
                        onClick={() => handleLoadSnippet(snippet)}
                        title="Load snippet"
                      >
                        📂
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDeleteSnippet(snippet._id)}
                        title="Delete snippet"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Members</h3>
            <div className="members-list">
              <div className="member-item">
                <span className="member-name">{workspace.ownerName}</span>
                <span className="badge badge-primary">👑 Owner</span>
              </div>
              {workspace.collaborators.map((collab, index) => (
                <div key={index} className="member-item">
                  <span className="member-name">{collab.username}</span>
                  <span className="badge badge-secondary">Collaborator</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-main">
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>
        </div>
      </div>

      {showSnippetModal && (
        <div className="modal-overlay" onClick={() => setShowSnippetModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Save Snippet</h2>
            </div>
            <form onSubmit={handleSaveSnippet}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Snippet Title</label>
                  <input
                    type="text"
                    className="input"
                    value={snippetTitle}
                    onChange={(e) => setSnippetTitle(e.target.value)}
                    placeholder="My awesome function"
                    required
                  />
                </div>
                <p className="helper-text">
                  This will save the current code to this workspace's snippets.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowSnippetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceEditor;
