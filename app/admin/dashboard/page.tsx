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
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Picture {
  type: 'url' | 'uploaded';
  data: string;
  filename?: string;
}

interface Letter {
  _id: string;
  phone: string;
  title: string;
  context: string;
  extra_note: string;
  pictures: Picture[];
  created_at: string;
}

// Custom Phone Input Component (no external dependencies)
const PhoneInput = ({ value, onChange, required }: { 
  value: string; 
  onChange: (value: string) => void;
  required?: boolean;
}) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Take only the last 8 digits (ignore if user types 976 prefix)
    let phoneDigits = digits;
    if (digits.startsWith('976')) {
      phoneDigits = digits.substring(3);
    }
    phoneDigits = phoneDigits.substring(0, 8);
    
    // Format as +976 XXXXXXXX
    if (phoneDigits.length === 0) {
      return '';
    } else if (phoneDigits.length <= 4) {
      return `+976 ${phoneDigits}`;
    } else {
      return `+976 ${phoneDigits.substring(0, 4)}${phoneDigits.substring(4)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].includes(e.keyCode)) {
      return;
    }
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88) && (e.ctrlKey || e.metaKey)) {
      return;
    }
    // Allow: home, end, left, right
    if (e.keyCode >= 35 && e.keyCode <= 39) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-700"
      placeholder="+976 ****-****"
      required={required}
    />
  );
};

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
    pictures: [] as Picture[],
  });
  const [newPictureUrl, setNewPictureUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');

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

    // Validate phone number format
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11 || !phoneDigits.startsWith('976')) {
      toast.error('Please enter a valid Mongolian phone number (8 digits)');
      return;
    }

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

  const addPictureUrl = () => {
    if (newPictureUrl.trim()) {
      try {
        new URL(newPictureUrl.trim());
        setFormData({
          ...formData,
          pictures: [
            ...formData.pictures,
            { type: 'url', data: newPictureUrl.trim() },
          ],
        });
        setNewPictureUrl('');
        toast.success('Image URL added!');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData({
          ...formData,
          pictures: [
            ...formData.pictures,
            {
              type: 'uploaded',
              data: base64String,
              filename: file.name,
            },
          ],
        });
        toast.success('Image uploaded successfully!');
        setUploadingImage(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }

    e.target.value = '';
  };

  const removePicture = (index: number) => {
    setFormData({
      ...formData,
      pictures: formData.pictures.filter((_, i) => i !== index),
    });
    toast.success('Image removed');
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
                        Phone Number * <span className="text-gray-500">(Mongolia)</span>
                      </label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: +976 XXXX-XXXX (Just type 8 digits)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-700"
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
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none h-32 text-gray-700"
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
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none h-24 text-gray-700"
                        placeholder="Additional special note..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pictures
                      </label>

                      {/* Image Input Mode Toggle */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setImageInputMode('upload')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            imageInputMode === 'upload'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <Upload size={18} />
                          Upload Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode('url')}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            imageInputMode === 'url'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <LinkIcon size={18} />
                          Add URL
                        </button>
                      </div>

                      {/* Upload Image */}
                      {imageInputMode === 'upload' && (
                        <div className="mb-3">
                          <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                            {uploadingImage ? (
                              <>
                                <Loader2 className="animate-spin text-blue-500" size={24} />
                                <span className="text-gray-600">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="text-gray-400" size={24} />
                                <span className="text-gray-600">
                                  Click to upload image (Max 5MB)
                                </span>
                              </>
                            )}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: JPG, PNG, GIF, WebP
                          </p>
                        </div>
                      )}

                      {/* Add URL */}
                      {imageInputMode === 'url' && (
                        <div className="flex gap-2 mb-3">
                          <input
                            type="url"
                            value={newPictureUrl}
                            onChange={(e) => setNewPictureUrl(e.target.value)}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-gray-700"
                            placeholder="https://example.com/image.jpg"
                          />
                          <button
                            type="button"
                            onClick={addPictureUrl}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                          >
                            <Plus size={20} />
                            Add
                          </button>
                        </div>
                      )}

                      {/* Picture List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {formData.pictures.map((picture, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg group hover:bg-gray-200 transition-colors"
                          >
                            <ImageIcon size={20} className="text-gray-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                              {picture.type === 'uploaded' ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-700 truncate">
                                    📎 {picture.filename}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Uploaded • {(picture.data.length / 1024).toFixed(1)}KB
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="text-sm font-medium text-gray-700">🔗 Image URL</div>
                                  <div className="text-xs text-gray-500 truncate">{picture.data}</div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removePicture(index)}
                              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {formData.pictures.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No images added yet</p>
                        </div>
                      )}
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