import React, { useState, useEffect } from 'react';
import './App.css';

// Unique id generator (for demo purpose)
function uuid() {
  return '_' + Math.random().toString(36).slice(2, 11);
}

// Dummy initial categories
const initialTags = [
  { name: 'All', color: '#1976d2' },
  { name: 'Work', color: '#fbc02d' },
  { name: 'Personal', color: '#424242' },
];

// Dummy initial notes for demo
const demoNotes = [
  {
    id: uuid(),
    title: 'Welcome!',
    content: 'This is your notes app. You can create, edit, search, and organize notes by tags.',
    tags: ['All', 'Personal'],
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  },
  {
    id: uuid(),
    title: 'Shopping List',
    content: '- Milk\n- Bread\n- Eggs',
    tags: ['All', 'Personal'],
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  },
  {
    id: uuid(),
    title: 'Project Ideas',
    content: '1. AI Note App\n2. Fitness Tracker Web\n3. Minimal Blog',
    tags: ['All', 'Work'],
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
];

// Top navigation bar
function TopNav({ onNewNote, searchValue, setSearchValue }) {
  return (
    <nav className="topnav">
      <div className="brand">📝 Notes</div>
      <input
        className="search-bar"
        type="text"
        placeholder="Search notes..."
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        aria-label="Search notes"
      />
      <button className="create-btn" onClick={onNewNote}>
        + New Note
      </button>
    </nav>
  );
}

// Sidebar for tags/categories
function Sidebar({ tags, selectedTag, setSelectedTag }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Tags</div>
      <ul className="sidebar-list">
        {tags.map(tag => (
          <li
            className={`sidebar-list-item${selectedTag === tag.name ? ' selected' : ''}`}
            style={{
              borderLeftColor: tag.color,
              color: selectedTag === tag.name ? tag.color : undefined
            }}
            key={tag.name}
            onClick={() => setSelectedTag(tag.name)}
          >
            {tag.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Note list in main area
function NotesList({ notes, onSelectNote, selectedNoteId }) {
  if (!notes.length) {
    return <div className="empty-msg">No notes found.</div>;
  }
  return (
    <div className="notes-list">
      {notes.map(note => (
        <div
          className={`note-list-item${selectedNoteId === note.id ? ' selected' : ''}`}
          key={note.id}
          onClick={() => onSelectNote(note)}
        >
          <div className="note-title">{note.title || <em>Untitled</em>}</div>
          <div className="note-tags-row">
            {note.tags && note.tags.map(tag => (
              <span key={tag} className="note-tag">{tag}</span>
            ))}
          </div>
          <div className="note-date">{(new Date(note.updated)).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// Modal for editing/creating a note
function NoteModal({ show, note, tags, onSave, onCancel }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [selectedTags, setSelectedTags] = useState(note?.tags || ["All"]);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setSelectedTags(note?.tags || ["All"]);
  }, [note, show]);

  const handleTagToggle = (tag) => {
    setSelectedTags(selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]);
  };

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...note,
      title: title.trim(),
      content,
      tags: selectedTags,
      updated: new Date().toISOString(),
      ...(note && note.created ? {} : { created: new Date().toISOString() }),
    });
  }

  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              autoFocus
              className="input"
              type="text"
              maxLength={120}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </label>
          <label>
            Content:
            <textarea
              className="textarea"
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start typing your note..."
            />
          </label>
          <label>
            Tags:
            <div>
              {tags.map(tag =>
                <button
                  key={tag.name}
                  type="button"
                  className={`tag-select-btn${selectedTags.includes(tag.name) ? ' selected' : ''}`}
                  style={{ borderColor: tag.color, color: tag.color }}
                  onClick={() => handleTagToggle(tag.name)}
                >
                  {tag.name}
                </button>
              )}
            </div>
          </label>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal to confirm deletion
function ConfirmModal({ show, title, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal confirm">
        <div>{title}</div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>No</button>
          <button className="save-btn" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

// Editor sidebar for editing note details
function NoteEditorSidebar({ note, onEdit, onDelete }) {
  if (!note) {
    return (
      <div className="editor-sidebar empty">
        <div>Select a note to view/edit details.</div>
      </div>
    );
  }
  return (
    <div className="editor-sidebar">
      <div className="editor-header">
        <div className="editor-title">{note.title || <em>Untitled</em>}</div>
        <div className="editor-tags">
          {note.tags && note.tags.map(tag => <span key={tag} className="note-tag">{tag}</span>)}
        </div>
        <div className="editor-date">Last edited: {(new Date(note.updated)).toLocaleString()}</div>
        <div className="editor-actions">
          <button className="edit-btn" onClick={() => onEdit(note)}>Edit</button>
          <button className="delete-btn" onClick={() => onDelete(note)}>Delete</button>
        </div>
      </div>
      <div className="editor-content">
        <pre>{note.content}</pre>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState(() => {
    // Retrieve from localStorage if available
    const stored = window.localStorage.getItem('NOTES_APP_DATA');
    return stored ? JSON.parse(stored) : demoNotes;
  });
  const [tags] = useState(initialTags);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [theme, setTheme] = useState('light');

  // Effect: persist notes in localStorage
  useEffect(() => {
    window.localStorage.setItem('NOTES_APP_DATA', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Filter notes by tag/category and search query
  const displayedNotes = notes.filter(note => {
    const matchesTag = selectedTag === 'All' || (note.tags && note.tags.includes(selectedTag));
    const matchesSearch =
      note.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      note.content.toLowerCase().includes(searchValue.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // PUBLIC_INTERFACE
  function handleSaveNote(newNote) {
    let updatedNotes;
    if (newNote.id) {
      updatedNotes = notes.map(n => (n.id === newNote.id ? newNote : n));
    } else {
      updatedNotes = [
        {
          ...newNote,
          id: uuid(),
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        ...notes,
      ];
    }
    setNotes(updatedNotes);
    setShowNoteModal(false);
    setEditingNote(null);
    if (!selectedNote || selectedNote.id === newNote.id) {
      setSelectedNote(newNote.id ? { ...newNote } : updatedNotes[0]); // Auto-select newly created or edited note
    }
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(note) {
    setNotes(notes.filter(n => n.id !== note.id));
    setShowDeleteModal(false);
    if (selectedNote && selectedNote.id === note.id) {
      setSelectedNote(null);
    }
  }

  function openEditModal(note) {
    setEditingNote(note);
    setShowNoteModal(true);
  }
  function openNewModal() {
    setEditingNote(null);
    setShowNoteModal(true);
  }

  return (
    <div className="app-shell">
      <TopNav
        onNewNote={openNewModal}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <div className="main-layout">
        <Sidebar
          tags={tags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        <div className="content-area">
          <NotesList
            notes={displayedNotes}
            onSelectNote={setSelectedNote}
            selectedNoteId={selectedNote?.id}
          />
        </div>
        <NoteEditorSidebar
          note={selectedNote}
          onEdit={openEditModal}
          onDelete={() => setShowDeleteModal(true)}
        />
      </div>

      <NoteModal
        show={showNoteModal}
        note={editingNote}
        tags={tags}
        onSave={handleSaveNote}
        onCancel={() => { setShowNoteModal(false); setEditingNote(null); }}
      />
      <ConfirmModal
        show={showDeleteModal}
        title="Are you sure you want to delete this note?"
        onConfirm={() => handleDeleteNote(selectedNote)}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
export default App;
