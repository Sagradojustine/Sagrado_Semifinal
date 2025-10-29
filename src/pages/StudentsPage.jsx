import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../lib/supabase';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  const handleSubmit = async (studentData) => {
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingStudent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;
      }
      setShowForm(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Link to="/students" className="text-white font-bold underline underline-offset-4 decoration-2">
                Students
              </Link>
              <Link to="/subjects" className="text-white hover:text-pink-100 font-medium transition-colors duration-200 hover:scale-105 transform">
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
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-fuchsia-600 text-transparent bg-clip-text flex items-center gap-2">
            ✨ Students Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-fuchsia-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            + Add New Student
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search students by name, student number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 border-3 border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 shadow-md bg-white/90 backdrop-blur-sm text-gray-800 font-medium placeholder-pink-400"
          />
        </div>

        {/* Students Table */}
        <div className="bg-gradient-to-br from-white to-pink-50 shadow-2xl rounded-3xl overflow-hidden border-4 border-pink-300">
          <table className="min-w-full divide-y divide-pink-200">
            <thead className="bg-gradient-to-r from-pink-400 to-fuchsia-400">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Year Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-pink-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-pink-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">
                    {student.student_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="bg-gradient-to-r from-pink-100 to-fuchsia-100 px-3 py-1 rounded-full font-semibold text-pink-700">
                      Year {student.year_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-3">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-fuchsia-600 hover:text-fuchsia-800 hover:underline transition-all duration-200"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:text-red-700 hover:underline transition-all duration-200"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-pink-600 font-medium">
              <div className="text-4xl mb-3">📚</div>
              No students found. {searchTerm && 'Try adjusting your search terms.'}
            </div>
          )}
        </div>

        {showForm && (
          <StudentForm
            student={editingStudent}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

// StudentForm Component
const StudentForm = ({ student, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    student_number: student?.student_number || '',
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    course: student?.course || '',
    year_level: student?.year_level || 1
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-white via-pink-50 to-fuchsia-50 rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-pink-400 relative transform animate-scale-in">
        <div className="absolute -top-4 -right-4 text-4xl">✨</div>
        <div className="absolute -bottom-4 -left-4 text-4xl">💕</div>
        
        <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-transparent bg-clip-text flex items-center gap-2">
          {student ? '✏️ Edit Student' : '➕ Add New Student'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-pink-700 mb-2">Student Number</label>
            <input
              type="text"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-2 border-pink-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-pink-400 focus:border-pink-500 bg-white shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-pink-700 mb-2">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-2 border-pink-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-pink-400 focus:border-pink-500 bg-white shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-pink-700 mb-2">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-2 border-pink-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-pink-400 focus:border-pink-500 bg-white shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-pink-700 mb-2">Course</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-2 border-pink-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-pink-400 focus:border-pink-500 bg-white shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-pink-700 mb-2">Year Level</label>
            <select
              name="year_level"
              value={formData.year_level}
              onChange={handleChange}
              required
              className="mt-1 block w-full border-2 border-pink-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-3 focus:ring-pink-400 focus:border-pink-500 bg-white shadow-sm font-medium"
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full hover:from-pink-600 hover:to-fuchsia-600 shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
            >
              {student ? '💾 Update' : '✨ Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentsPage;