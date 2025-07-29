'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createNote, deleteNote, getNotes } from '../actions/noteActions';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function Dashboard() {
  const { data: session } = useSession({ required: true });
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');


  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const userNotes = await getNotes();
        setNotes(userNotes);
      } catch (err) {
        toast.error('Failed to fetch notes.');
      }
    };
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required.');
      return;
    }
    try {
      const newNote = await createNote({ title, content });
      setNotes([...notes, newNote]);
      setTitle('');
      setContent('');
      toast.success('Note created!');
    } catch (err) {
      toast.error('Failed to create note.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
      toast.success('Note deleted.');
    } catch (err) {
      toast.error('Failed to delete note.');
    }
  };

  if (!session) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 to-emerald-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Welcome, {session.user?.name}</h1>
            <p className="text-gray-500">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold transition"
          >
            Sign Out
          </button>
        </div>

        {/* Create Note Form */}
        <form
          onSubmit={handleCreateNote}
          className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-10 shadow-sm"
        >
          <h2 className="text-xl font-bold mb-4">Create a New Note</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-gray-700 font-medium mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none min-h-[80px]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-semibold transition"
          >
            Add Note
          </button>
        </form>

        {/* Notes List */}
        <section>
          <h2 className="text-xl font-bold mb-6">Your Notes</h2>
          {notes.length === 0 ? (
            <p className="text-gray-500">You haven&#39;t added any notes yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{note.title}</h3>
                  <p className="text-gray-700 mb-4">{note.content}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}