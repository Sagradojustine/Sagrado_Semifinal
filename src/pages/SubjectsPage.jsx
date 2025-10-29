import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase  from '../lib/supabase';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setShowForm(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const { error } = await supabase
          .from('subjects')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject');
      }
    }
  };

  const handleSubmit = async (subjectData) => {
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', editingSubject.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([subjectData]);

        if (error) throw error;
      }
      setShowForm(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert('Error saving subject');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-fuchsia-200 flex items-center justify-center">
        <div className="text-lg font-bold text-pink-600 animate-pulse">Loading... ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-fuchsia-200 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-fuchsia-300 rounded-full opacity-30 animate-pulse delay-75"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-pink-400 rounded-full opacity-15 animate-pulse delay-150"></div>

      {/* Navigation */}
      <nav className="bg-gradient-to-r from-pink-500 via-pink-600 to-fuchsia-500 shadow-xl border-b-4 border-pink-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-white drop-shadow-lg flex items-center gap-2">
              💖 Grade Management System
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-white hover:text-pink-100 font-medium transition-colors duration-200 hover:scale-105 transform">
                Home
              </Link>
              <Link to="/students" className="text-white hover:text-pink-100 font-medium transition-colors duration-200 hover:scale-105 transform">
                Students
              </Link>
              <Link to="/subjects" className="text-white font-bold underline underline-offset-4 decoration-2">
                Subjects
              </Link>
              <Link to="/grades" className="text-white hover:text-pink-100 font-medium transition-colors duration-200 hover:scale-105 transform">
                Grades
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-linear-to-r from-pink-600 to-fuchsia-600 text-transparent bg-clip-text flex items-center gap-2">
            ✨ Subjects Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-linear-to-r from-pink-500 to-fuchsia-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-fuchsia-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            + Add New Subject
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search subjects by code, name, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 border-3 border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 shadow-md bg-white/90 backdrop-blur-sm text-gray-800 font-medium placeholder-pink-400"
          />
        </div>

        {/* Subjects Table */}
        <div className="bg-linear-to-br from-white to-pink-50 shadow-2xl rounded-3xl overflow-hidden border-4 border-pink-300">
          <table className="min-w-full divide-y divide-pink-200">
            <thead className="bg-linear-to-r from-pink-400 to-fuchsia-400">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Subject Code
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Subject Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-pink-100">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-pink-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">
                    {subject.subject_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    {subject.subject_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="bg-linear-to-r from-pink-100 to-fuchsia-100 px-3 py-1 rounded-full font-semibold text-pink-700">
                      {subject.instructor}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-3">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="text-pink-600 hover:text-pink-800 transition-colors duration-200"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subjects found. {searchTerm && 'Try adjusting your search terms.'}
            </div>
          )}
        </div>

        {showForm && (
          <SubjectForm
            subject={editingSubject}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

// SubjectForm Component
const SubjectForm = ({ subject, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    subject_code: subject?.subject_code || '',
    subject_name: subject?.subject_name || '',
    instructor: subject?.instructor || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {subject ? 'Edit Subject' : 'Add New Subject'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Name</label>
            <input
              type="text"
              name="subject_name"
              value={formData.subject_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instructor</label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {subject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectsPage;