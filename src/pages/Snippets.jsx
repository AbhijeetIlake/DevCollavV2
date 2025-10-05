import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import './Snippets.css';

const API_BASE = import.meta.env.VITE_API_URL;

function Snippets() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    lang: 'javascript',
    isPublic: false,
    tags: []
  });

  useEffect(() => {
    fetchSnippets();
  }, [user]);

  useEffect(() => {
    filterSnippets();
  }, [snippets, searchTerm, filterType]);

  const fetchSnippets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/snippets?userId=${user.id}`);
      setSnippets(response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSnippets = () => {
    let filtered = snippets;

    if (filterType === 'public') {
      filtered = filtered.filter(s => s.isPublic);
    } else if (filterType === 'private') {
      filtered = filtered.filter(s => !s.isPublic);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSnippets(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSnippet) {
        await axios.put(`${API_BASE}/api/snippets/${editingSnippet._id}`, formData);
      } else {
        await axios.post(`${API_BASE}/api/snippets`, {
          ...formData,
          userId: user.id
        });
      }
      fetchSnippets();
      closeModal();
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await axios.delete(`${API_BASE}/api/snippets/${id}?userId=${user.id}`);
        fetchSnippets();
      } catch (error) {
        console.error('Error deleting snippet:', error);
      }
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Code copied to clipboard!');
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const openModal = (snippet = null) => {
    if (snippet) {
      setEditingSnippet(snippet);
      setFormData({
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        lang: snippet.lang,
        isPublic: snippet.isPublic,
        tags: snippet.tags
      });
    } else {
      setEditingSnippet(null);
      setFormData({
        title: '',
        description: '',
        code: '',
        lang: 'javascript',
        isPublic: false,
        tags: []
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSnippet(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading snippets...</p>
      </div>
    );
  }

  return (
    <div className="snippets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Code Snippets</h1>
          <p className="page-subtitle">Manage your code snippets</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + New Snippet
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search snippets..."
          className="input search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`btn ${filterType === 'public' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('public')}
          >
            Public
          </button>
          <button
            className={`btn ${filterType === 'private' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterType('private')}
          >
            Private
          </button>
        </div>
      </div>

      <div className="snippets-grid">
        {filteredSnippets.length === 0 ? (
          <div className="empty-state">
            <p>No snippets found</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Create your first snippet
            </button>
          </div>
        ) : (
          filteredSnippets.map(snippet => (
            <div key={snippet._id} className="snippet-card">
              <div className="snippet-header">
                <h3 className="snippet-title">{snippet.title}</h3>
                <span className={`badge ${snippet.isPublic ? 'badge-success' : 'badge-warning'}`}>
                  {snippet.isPublic ? '🔓 Public' : '🔒 Private'}
                </span>
              </div>
              {snippet.description && (
                <p className="snippet-description">{snippet.description}</p>
              )}
              <div className="snippet-meta">
                <span className="badge badge-primary">{snippet.lang}</span>
                <span className="snippet-date">
                  {new Date(snippet.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="snippet-actions">
                <button className="btn btn-secondary" onClick={() => handleCopy(snippet.code)}>
                  Copy
                </button>
                <button className="btn btn-outline" onClick={() => openModal(snippet)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(snippet._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSnippet ? 'Edit Snippet' : 'Create New Snippet'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Language</label>
                    <select
                      className="select"
                      value={formData.lang}
                      onChange={(e) => setFormData({ ...formData, lang: e.target.value })}
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
                  <div className="form-group">
                    <label className="label">Visibility</label>
                    <select
                      className="select"
                      value={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'true' })}
                    >
                      <option value="false">Private</option>
                      <option value="true">Public</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Code</label>
                  <div className="editor-container">
                    <Editor
                      height="300px"
                      language={formData.lang}
                      value={formData.code}
                      onChange={(value) => setFormData({ ...formData, code: value || '' })}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSnippet ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Snippets;
