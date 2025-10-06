import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './WorkspaceEditor.css';

const API_BASE = import.meta.env.VITE_API_URL;

function WorkspaceEditor() {
  const { workspaceId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
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

  // ----------------------------
  // Fetch workspace data
  // ----------------------------
  const fetchWorkspace = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/workspaces/${workspaceId}`);
      setWorkspace(response.data);
      setCode(response.data.currentCode || '');
      setLanguage(response.data.language || 'javascript');
    } catch (error) {
      console.error('Error fetching workspace:', error);
      alert('Workspace not found');
      navigate('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Initialize Socket.IO
  // ----------------------------
  const initializeSocket = () => {
    socketRef.current = io(API_BASE, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-workspace', {
        workspaceId,
        userId: user.id,
        username: user.fullName || user.username,
      });
    });

    // Update connected users
    socketRef.current.on('users-update', (users) => {
      setConnectedUsers(users);
    });

    // Receive code updates from other collaborators
    socketRef.current.on('content-update', (content) => {
      setCode(content);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  // ----------------------------
  // Handle editor changes
  // ----------------------------
  const handleEditorChange = (value) => {
    setCode(value || '');
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        workspaceId,
        content: value || '',
      });
    }
  };

  // ----------------------------
  // Save snippet
  // ----------------------------
  const handleSaveSnippet = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/workspaces/${workspaceId}/snippets`, {
        title: snippetTitle,
        code: code,
        language: language,
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

  // ----------------------------
  // Load snippet
  // ----------------------------
  const handleLoadSnippet = (snippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        workspaceId,
        content: snippet.code,
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) return null;

  const isOwner = workspace.ownerId === user.id;

  return (
    <div className="workspace-editor">
      {/* Editor Header */}
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
        </div>
      </div>

      {/* Editor and Sidebar */}
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
                workspace.snippets.map((snippet) => (
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
                    </div>
                  </div>
                ))
              )}
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
    </div>
  );
}

export default WorkspaceEditor;
