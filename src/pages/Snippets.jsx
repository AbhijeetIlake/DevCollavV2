import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "./Snippets.css";

const API_BASE = import.meta.env.VITE_API_URL;

function Snippets() {
  const { user } = useUser();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showOutput, setShowOutput] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    lang: "javascript",
    isPublic: false,
    tags: [],
  });

  // Fetch snippets based on current filter
  const fetchSnippets = async (filter = "all") => {
    if (!user) return;
    setLoading(true);
    try {
      let query = `?userId=${user.id}`;
      if (filter === "public") query = "?isPublic=true";
      else if (filter === "private")
        query = `?userId=${user.id}&isPublic=false`;
      // "all" is handled by backend to return public + current user's private

      const response = await axios.get(`${API_BASE}/api/snippets${query}`);
      setSnippets(response.data);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSnippets(filterType);
  }, [user]);

  const filteredSnippets = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("User not logged in!");

    const payload = {
      userId: user.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      code: formData.code,
      lang: formData.lang,
      isPublic: Boolean(formData.isPublic),
      tags: formData.tags.map((tag) => tag.trim()).filter((tag) => tag),
    };

    try {
      if (editingSnippet) {
        await axios.put(
          `${API_BASE}/api/snippets/${editingSnippet._id}`,
          payload
        );
      } else {
        await axios.post(`${API_BASE}/api/snippets`, payload);
      }
      fetchSnippets(filterType);
      closeModal();
    } catch (error) {
      console.error("Error saving snippet:", error);
      alert("Failed to save snippet. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this snippet?"))
      return;
    try {
      await axios.delete(`${API_BASE}/api/snippets/${id}?userId=${user.id}`);
      fetchSnippets(filterType);
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Code copied to clipboard!");
    } catch (error) {
      console.error("Error copying code:", error);
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
        tags: snippet.tags || [],
      });
    } else {
      setEditingSnippet(null);
      setFormData({
        title: "",
        description: "",
        code: "",
        lang: "javascript",
        isPublic: false,
        tags: [],
      });
    }
    setShowOutput(false);
    setCodeOutput("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSnippet(null);
    setCodeOutput("");
    setShowOutput(false);
  };

  const handleRunCode = () => {
    setShowOutput(true);
    setCodeOutput("Running code...");

    if (formData.lang !== "javascript") {
      setCodeOutput(
        "⚠️ Code execution is currently only supported for JavaScript."
      );
      return;
    }

    try {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(
          args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
            )
            .join(" ")
        );
      };

      try {
        const result = eval(formData.code);
        console.log = originalLog;
        let output = logs.join("\n");
        if (result !== undefined) {
          output +=
            (output ? "\n\n" : "") +
            "→ " +
            (typeof result === "object"
              ? JSON.stringify(result, null, 2)
              : String(result));
        }
        setCodeOutput(output || "✓ Code executed successfully (no output)");
      } catch (err) {
        console.log = originalLog;
        setCodeOutput("❌ Error: " + err.message);
      }
    } catch (err) {
      setCodeOutput("❌ Execution Error: " + err.message);
    }
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
          className="input search-input my-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons my-snippet-filter-button">
          <button
            className={`btn ${
              filterType === "all" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setFilterType("all");
              fetchSnippets("all");
            }}
          >
            All
          </button>
          <button
            className={`btn ${
              filterType === "public" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setFilterType("public");
              fetchSnippets("public");
            }}
          >
            Public
          </button>
          <button
            className={`btn ${
              filterType === "private" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => {
              setFilterType("private");
              fetchSnippets("private");
            }}
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
          filteredSnippets.map((snippet) => (
            <div key={snippet._id} className="snippet-card">
              <div className="snippet-header">
                <h3 className="snippet-title">{snippet.title}</h3>
                <span
                  className={`badge ${
                    snippet.isPublic ? "badge-success" : "badge-warning"
                  }`}
                >
                  {snippet.isPublic ? "🔓 Public" : "🔒 Private"}
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
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCopy(snippet.code)}
                >
                  Copy
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => openModal(snippet)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(snippet._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingSnippet ? "Edit Snippet" : "Create New Snippet"}
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
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label">
                    Tags (press Enter or comma to add)
                  </label>
                  <div className="tags-input-container">
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag-item">
                          {tag}
                          <button
                            type="button"
                            className="remove-tag-btn"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                tags: formData.tags.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="input tag-input"
                      placeholder="Add tag..."
                      onKeyDown={(e) => {
                        if (
                          (e.key === "Enter" || e.key === ",") &&
                          e.target.value.trim()
                        ) {
                          e.preventDefault();
                          const newTag = e.target.value.trim();
                          if (!formData.tags.includes(newTag)) {
                            setFormData({
                              ...formData,
                              tags: [...formData.tags, newTag],
                            });
                          }
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Language</label>
                    <select
                      className="select"
                      value={formData.lang}
                      onChange={(e) =>
                        setFormData({ ...formData, lang: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPublic: e.target.value === "true",
                        })
                      }
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
                      onChange={(value) =>
                        setFormData({ ...formData, code: value || "" })
                      }
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </div>
                </div>
                {showOutput && (
                  <div className="form-group">
                    <label className="label">Output</label>
                    <div className="code-output">
                      <pre>{codeOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                {formData.lang === "javascript" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRunCode}
                  >
                    ▶ Run Code
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editingSnippet ? "Update" : "Create"}
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
