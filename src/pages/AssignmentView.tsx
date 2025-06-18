import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Question {
  id: string;
  question_text: string;
  options?: string[];
  marks: number;
  correct_option?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'mcq' | 'written';
  deadline: string;
  class_name: string;
  subject_name: string;
  questions: Question[];
}

function AssignmentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssignment();
    }
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data);
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    const confirmSubmit = window.confirm('Are you sure you want to submit this assignment? You cannot change your answers after submission.');
    if (!confirmSubmit) return;

    setSubmitting(true);
    try {
      const payload = {
        answers: assignment.type === 'mcq' ? answers : { answer: answers.written || '' }
      };

      const response = await api.post(`/assignments/${id}/submit`, payload);
      
      if (response.data.score !== null) {
        alert(`Assignment submitted successfully! Your score: ${response.data.score}`);
      } else {
        alert('Assignment submitted successfully! Your teacher will grade it soon.');
      }
      
      setSubmitted(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = assignment && new Date(assignment.deadline) < new Date();
  const canSubmit = user?.role === 'student' && !submitted && !isOverdue;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {assignment.subject_name} • {assignment.class_name}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
              assignment.type === 'mcq' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {assignment.type.toUpperCase()}
            </span>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Due: {new Date(assignment.deadline).toLocaleString()}</span>
            </div>
          </div>

          {isOverdue && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>

        {assignment.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{assignment.description}</p>
          </div>
        )}

        {assignment.type === 'mcq' && assignment.questions.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            {assignment.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    {index + 1}. {question.question_text}
                  </h4>
                  <p className="text-sm text-gray-500">({question.marks} mark{question.marks !== 1 ? 's' : ''})</p>
                </div>

                {question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={!canSubmit}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Show correct answer for admin/teacher */}
                {(user?.role === 'admin' || user?.role === 'teacher') && question.correct_option && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Correct Answer:</strong> {question.correct_option}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {assignment.type === 'written' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
            <textarea
              rows={10}
              value={answers.written || ''}
              onChange={(e) => handleAnswerChange('written', e.target.value)}
              disabled={!canSubmit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {canSubmit && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Assignment</span>
                </>
              )}
            </button>
          </div>
        )}

        {submitted && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Assignment submitted successfully!</span>
            </div>
          </div>
        )}

        {isOverdue && user?.role === 'student' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">This assignment is overdue and cannot be submitted.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentView;