import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  deadline: string;
  subject_name: string;
  submission_id?: string;
  total_score?: number;
  is_marked?: boolean;
  submitted_at?: string;
}

export default function SubjectView() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get(`/student/subjects/${subjectId}/assignments`);
        setAssignments(response.data);
        if (response.data.length > 0) {
          setSubjectName(response.data[0].subject_name);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [subjectId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.submission_id) {
      if (assignment.is_marked) {
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      } else {
        return <Clock className="h-5 w-5 text-yellow-600" />;
      }
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? 
      <AlertCircle className="h-5 w-5 text-red-600" /> : 
      <Clock className="h-5 w-5 text-blue-600" />;
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.submission_id) {
      if (assignment.is_marked) {
        return `Completed (${assignment.total_score} marks)`;
      } else {
        return 'Submitted - Pending Review';
      }
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? 'Overdue' : 'Not Started';
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.submission_id) {
      return assignment.is_marked ? 'text-green-600' : 'text-yellow-600';
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{subjectName}</h1>
                <p className="text-sm text-gray-600">Subject Assignments</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignments</h2>
          <p className="text-gray-600">Complete your assignments and track your progress</p>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">Check back later for new assignments in this subject.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(assignment.deadline).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          {assignment.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`flex items-center gap-2 ${getStatusColor(assignment)}`}>
                          {getStatusIcon(assignment)}
                          <span className="text-sm font-medium">{getStatusText(assignment)}</span>
                        </div>
                        {assignment.submitted_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(assignment.submitted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      {!assignment.submission_id && (
                        <button
                          onClick={() => navigate(`/assignments/${assignment.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Start Assignment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}