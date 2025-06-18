import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, FileText, HelpCircle } from 'lucide-react';
import api from '../../utils/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'mcq' | 'written';
  deadline: string;
  is_submitted: boolean;
  total_score?: number;
  is_marked: boolean;
  submitted_at?: string;
}

function Assignments() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    if (subjectId) {
      fetchAssignments();
    }
  }, [subjectId]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/student/subjects/${subjectId}/assignments`);
      setAssignments(response.data);
      
      // Get subject name from first assignment or make separate API call
      if (response.data.length > 0) {
        // You might want to add subject name to the response or make a separate call
        setSubjectName('Subject'); // Placeholder
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.is_submitted) {
      if (assignment.is_marked) {
        return 'bg-green-100 text-green-800';
      }
      return 'bg-yellow-100 text-yellow-800';
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.is_submitted) {
      if (assignment.is_marked) {
        return 'Graded';
      }
      return 'Submitted';
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? 'Overdue' : 'Pending';
  };

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.is_submitted) {
      if (assignment.is_marked) {
        return <CheckCircle className="h-4 w-4" />;
      }
      return <Clock className="h-4 w-4" />;
    }
    
    const isOverdue = new Date(assignment.deadline) < new Date();
    return isOverdue ? <Clock className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/student/subjects"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete your assignments and track your progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {assignment.description}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                assignment.type === 'mcq' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {assignment.type === 'mcq' ? (
                  <>
                    <HelpCircle className="h-3 w-3 mr-1" />
                    MCQ
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    Written
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment)}`}>
                  {getStatusIcon(assignment)}
                  <span className="ml-1">{getStatusText(assignment)}</span>
                </span>
                
                {assignment.is_marked && assignment.total_score !== undefined && (
                  <span className="text-sm font-medium text-gray-900">
                    Score: {assignment.total_score}
                  </span>
                )}
              </div>

              {assignment.submitted_at && (
                <div className="text-xs text-gray-500">
                  Submitted: {new Date(assignment.submitted_at).toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              {!assignment.is_submitted && new Date(assignment.deadline) > new Date() ? (
                <Link
                  to={`/assignments/${assignment.id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Start Assignment
                </Link>
              ) : (
                <Link
                  to={`/assignments/${assignment.id}`}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Assignments for this subject will appear here when available.
          </p>
        </div>
      )}
    </div>
  );
}

export default Assignments;