'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  LogOut,
  Mail,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Letter {
  _id: string;
  phone: string;
  title: string;
  context: string;
  extra_note: string;
  pictures: string[];
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    title: '',
    context: '',
    extra_note: '',
    pictures: [] as string[],
  });
  const [newPictureUrl, setNewPictureUrl] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/letters', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setLetters(data.letters);
      }
    } catch (error) {
      toast.error('Failed to fetch letters');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const openCreateModal = () => {
    setEditingLetter(null);
    setFormData({
      phone: '',
      title: '',
      context: '',
      extra_note: '',
      pictures: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (letter: Letter) => {
    setEditingLetter(letter);
    setFormData({
      phone: letter.phone,
      title: letter.title,
      context: letter.context,
      extra_note: letter.extra_note,
      pictures: letter.pictures,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    const method = editingLetter ? 'PUT' : 'POST';
    const body = editingLetter
      ? { ...formData, _id: editingLetter._id }
      : formData;

    try {
      const response = await fetch('/api/admin/letters', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingLetter ? 'Letter updated successfully!' : 'Letter created successfully!'
        );
        setIsModalOpen(false);
        fetchLetters();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this letter?')) return;

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`/api/admin/letters?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Letter deleted successfully!');
        fetchLetters();
      } else {
        toast.error('Failed to delete letter');
      }
    } catch (error) {
      toast.error('Delete operation failed');
    }
  };

  const addPicture = () => {
    if (newPictureUrl.trim()) {
      setFormData({
        ...formData,
        pictures: [...formData.pictures, newPictureUrl.trim()],
      });
      setNewPictureUrl('');
    }
  };

  const removePicture = (index: number) => {
    setFormData({
      ...formData,
      pictures: formData.pictures.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-100 via-white to-green-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎄</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage Christmas Letters</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-linear-to-r from-red-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create New Letter
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-red-500" size={48} />
          </div>
        ) : (
          <div className="grid gap-6">
            {letters.map((letter, index) => (
              <motion.div
                key={letter._id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="text-red-500" size={24} />
                      <h3 className="text-xl font-bold text-gray-800">{letter.title}</h3>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Phone:</span> {letter.phone}
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-semibold">Content:</span> {letter.context}
                      </p>
                      {letter.extra_note && (
                        <p className="line-clamp-1">
                          <span className="font-semibold">Note:</span> {letter.extra_note}
                        </p>
                      )}
                      {letter.pictures.length > 0 && (
                        <p>
                          <span className="font-semibold">Pictures:</span> {letter.pictures.length}{' '}
                          image(s)
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {new Date(letter.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEditModal(letter)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Edit size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(letter._id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {letters.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-600">No letters yet. Create your first one!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editingLetter ? 'Edit Letter' : 'Create New Letter'}
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-500"
                        placeholder="+1234567890"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-500"
                        placeholder="A Special Christmas Wish"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        value={formData.context}
                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none h-32 text-gray-500"
                        placeholder="Your Christmas message..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Note (Optional)
                      </label>
                      <textarea
                        value={formData.extra_note}
                        onChange={(e) => setFormData({ ...formData, extra_note: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none h-24 text-gray-500"
                        placeholder="Additional special note..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pictures (URLs)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="url"
                          value={newPictureUrl}
                          onChange={(e) => setNewPictureUrl(e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={addPicture}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.pictures.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg"
                          >
                            <ImageIcon size={16} className="text-gray-600" />
                            <span className="flex-1 text-sm truncate">{url}</span>
                            <button
                              type="button"
                              onClick={() => removePicture(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        <Save size={20} />
                        {editingLetter ? 'Update Letter' : 'Create Letter'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}