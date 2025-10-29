import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import   supabase  from '../lib/supabase';

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesResponse, studentsResponse, subjectsResponse] = await Promise.all([
        supabase.from('grades').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*'),
        supabase.from('subjects').select('*')
      ]);

      if (gradesResponse.error) throw gradesResponse.error;
      if (studentsResponse.error) throw studentsResponse.error;
      if (subjectsResponse.error) throw subjectsResponse.error;

      setGrades(gradesResponse.data || []);
      setStudents(studentsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGrade(null);
    setShowForm(true);
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade record?')) {
      try {
        const { error } = await supabase
          .from('grades')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchData();
      } catch (error) {
        console.error('Error deleting grade:', error);
        alert('Error deleting grade');
      }
    }
  };

  const handleSubmit = async (gradeData) => {
    try {
      if (editingGrade) {
        const { error } = await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', editingGrade.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('grades')
          .insert([gradeData]);

        if (error) throw error;
      }
      setShowForm(false);
      setEditingGrade(null);
      fetchData();
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Error saving grade');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGrade(null);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.subject_name : 'Unknown';
  };

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.subject_code : 'Unknown';
  };

  const calculateFinalGrade = (grade) => {
    const prelim = parseFloat(grade.prelim) || 0;
    const midterm = parseFloat(grade.midterm) || 0;
    const semifinal = parseFloat(grade.semifinal) || 0;
    const final = parseFloat(grade.final) || 0;
    
    return (prelim * 0.2 + midterm * 0.2 + semifinal * 0.2 + final * 0.4).toFixed(1);
  };

  const getGradeColor = (grade) => {
    const finalGrade = parseFloat(grade);
    if (finalGrade >= 90) return 'bg-linear-to-r from-green-500 to-emerald-500 text-white';
    if (finalGrade >= 80) return 'bg-linear-to-r from-blue-500 to-indigo-500 text-white';
    if (finalGrade >= 75) return 'bg-linear-to-r from-yellow-400 to-amber-500 text-white';
    return 'bg-linear-to-r from-red-500 to-rose-500 text-white';
  };

  const filteredGrades = grades.filter(grade => {
    const studentName = getStudentName(grade.student_id).toLowerCase();
    const subjectName = getSubjectName(grade.subject_id).toLowerCase();
    const subjectCode = getSubjectCode(grade.subject_id).toLowerCase();
    
    return studentName.includes(searchTerm.toLowerCase()) ||
           subjectName.includes(searchTerm.toLowerCase()) ||
           subjectCode.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-100 via-pink-200 to-fuchsia-200 flex items-center justify-center">
        <div className="text-lg font-bold text-pink-600 animate-pulse">Loading... ✨</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-100 via-pink-200 to-fuchsia-200 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-fuchsia-300 rounded-full opacity-30 animate-pulse delay-75"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-pink-400 rounded-full opacity-15 animate-pulse delay-150"></div>

      {/* Navigation */}
      <nav className="bg-linear-to-r from-pink-500 via-pink-600 to-fuchsia-500 shadow-xl border-b-4 border-pink-300">
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
              <Link to="/subjects" className="text-white hover:text-pink-100 font-medium transition-colors duration-200 hover:scale-105 transform">
                Subjects
              </Link>
              <Link to="/grades" className="text-white font-bold underline underline-offset-4 decoration-2">
                Grades
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold bg-linear-to-r from-pink-600 to-fuchsia-600 text-transparent bg-clip-text flex items-center gap-2">
            ✨ Grades Management
          </h1>
          <button
            onClick={handleCreate}
            className="bg-linear-to-r from-pink-500 to-fuchsia-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-fuchsia-600 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            + Add New Grade
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search grades by student name, subject name, or subject code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 border-3 border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 shadow-md bg-white/90 backdrop-blur-sm text-gray-800 font-medium placeholder-pink-400"
          />
        </div>

        {/* Grades Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prelim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Midterm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semi-final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Computed Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => {
                const finalGrade = calculateFinalGrade(grade);
                return (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getStudentName(grade.student_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSubjectCode(grade.subject_id)} - {getSubjectName(grade.subject_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.prelim || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.midterm || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.semifinal || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.final || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(finalGrade)}`}>
                        {finalGrade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No grade records found. {searchTerm && 'Try adjusting your search terms.'}
            </div>
          )}
        </div>

        {showForm && (
          <GradeForm
            grade={editingGrade}
            students={students}
            subjects={subjects}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

// GradeForm Component
const GradeForm = ({ grade, students, subjects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    student_id: grade?.student_id || '',
    subject_id: grade?.subject_id || '',
    prelim: grade?.prelim || '',
    midterm: grade?.midterm || '',
    semifinal: grade?.semifinal || '',
    final: grade?.final || ''
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
          {grade ? 'Edit Grade' : 'Add New Grade'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prelim Grade</label>
            <input
              type="number"
              name="prelim"
              value={formData.prelim}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Midterm Grade</label>
            <input
              type="number"
              name="midterm"
              value={formData.midterm}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semi-final Grade</label>
            <input
              type="number"
              name="semifinal"
              value={formData.semifinal}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Final Grade</label>
            <input
              type="number"
              name="final"
              value={formData.final}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
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
              {grade ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradesPage;