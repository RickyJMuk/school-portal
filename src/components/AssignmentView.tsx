import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Question {
  id: string;
  question_text: string;
  options: Record<string, string>;
  marks: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  deadline: string;
  class_name: string;
  subject_name: string;
  questions: Question[];
  submission: any;
}

export default function AssignmentView() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`/student/assignments/${assignmentId}`);
        setAssignment(response.data);
        setSubmitted(!!response.data.submission);
        
        // If already submitted, load the answers
        if (response.data.submission?.answers) {
          setAnswers(response.data.submission.answers);
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    
    setSubmitting(true);
    try {
      await axios.post(`/student/assignments/${assignmentId}/submit`, { answers });
      setSubmitted(true);
      
      // Refresh assignment data to get submission details
      const response = await axios.get(`/student/assignments/${assignmentId}`);
      setAssignment(response.data);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(assignment.deadline) < new Date();
  const totalMarks = assignment.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{assignment.title}</h1>
              <p className="text-sm text-gray-600">{assignment.subject_name} • {assignment.class_name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
              {assignment.description && (
                <p className="text-gray-600 mb-4">{assignment.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  Due: {new Date(assignment.deadline).toLocaleString()}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {assignment.type.toUpperCase()}
                </span>
                <span className="text-gray-600">
                  Total Marks: {totalMarks}
                </span>
              </div>
            </div>
            
            {submitted && assignment.submission && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Submitted</span>
                </div>
                {assignment.submission.is_marked && (
                  <p className="text-lg font-bold text-gray-900">
                    Score: {assignment.submission.total_score}/{totalMarks}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(assignment.submission.submitted_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          
          {isOverdue && !submitted && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">This assignment is overdue</span>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {assignment.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Question {index + 1} ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                </h3>
                <p className="text-gray-700">{question.question_text}</p>
              </div>

              {assignment.type === 'mcq' && question.options ? (
                <div className="space-y-3">
                  {Object.entries(question.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        answers[question.id] === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${submitted ? 'cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={key}
                        checked={answers[question.id] === key}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={submitted}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        <strong>{key}.</strong> {value}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[120px] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!submitted && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}