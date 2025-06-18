import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { BookOpen, Clock, Award, User, LogOut, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Subject {
  id: string;
  name: string;
  class_name: string;
}

interface Performance {
  subject_name: string;
  assignment_title: string;
  total_score: number;
  max_score: number;
  submitted_at: string;
  is_marked: boolean;
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, performanceRes] = await Promise.all([
          axios.get('/student/subjects'),
          axios.get('/student/performance')
        ]);
        
        setSubjects(subjectsRes.data);
        setPerformance(performanceRes.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const averageScore = performance.length > 0
    ? performance.reduce((acc, p) => acc + (p.total_score / p.max_score * 100), 0) / performance.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">School Portal</h1>
                <p className="text-sm text-gray-600">Student Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-600">{user?.classInfo?.class_name}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center gap-4">
            <User className="h-12 w-12 bg-blue-500 p-2 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.fullName}!</h2>
              <p className="text-blue-100">Class: {user?.classInfo?.class_name} • {user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Available Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Completed Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{performance.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Your Subjects</h3>
              <p className="text-sm text-gray-600">Click on a subject to view assignments</p>
            </div>
            <div className="p-6">
              {subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No subjects assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => navigate(`/subjects/${subject.id}`)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{subject.name}</p>
                          <p className="text-sm text-gray-600">{subject.class_name}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Performance</h3>
              <p className="text-sm text-gray-600">Your latest assignment scores</p>
            </div>
            <div className="p-6">
              {performance.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No completed assignments yet</p>
              ) : (
                <div className="space-y-4">
                  {performance.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.assignment_title}</p>
                        <p className="text-xs text-gray-600">{item.subject_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.is_marked ? (
                          <div>
                            <p className="font-bold text-lg text-gray-900">
                              {item.total_score}/{item.max_score}
                            </p>
                            <p className="text-xs text-gray-600">
                              {((item.total_score / item.max_score) * 100).toFixed(1)}%
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-600 font-medium">Pending</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}