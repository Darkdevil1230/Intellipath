import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import FriendlyError from '../components/ui/FriendlyError';
import { Skeleton } from '../components/ui/Skeleton';
import { classifyApiError, getErrorMessage } from '../utils/apiErrors';

const AssessmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => api.get(`/assessment/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 card" aria-busy="true">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-24 mx-auto" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error || !assessment) {
    const is404 = error?.response?.status === 404;
    return (
      <FriendlyError
        variant={is404 ? 'notFound' : classifyApiError(error) === 'network' ? 'network' : 'noResults'}
        title={is404 ? 'Assessment not found' : undefined}
        description={
          is404
            ? 'This assessment may have been removed or the link is incorrect.'
            : getErrorMessage(error, 'Could not load this assessment.')
        }
        actionTo="/assessments"
        actionLabel="Back to assessments"
        onRetry={!is404 ? () => window.location.reload() : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/assessments')}
        className="flex items-center text-sm text-primary-600 hover:text-primary-500"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Assessments
      </button>

      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Topic: {assessment.topic}
          </p>
          {assessment.completedAt && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Completed {new Date(assessment.completedAt).toLocaleString()}
            </p>
          )}
          <div className="mt-4">
            <span className="text-5xl font-bold text-primary-600">
              {assessment.score?.toFixed(0) ?? 0}%
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {assessment.questions?.map((question, qIndex) => {
            const userAnswer = assessment.userAnswers?.[qIndex];
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div
                key={qIndex}
                className={`p-4 rounded-lg ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {qIndex + 1}. {question.question}
                  </p>
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                </div>
                {userAnswer && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Your answer: {question.options?.[userAnswer.answer] ?? '—'}
                  </p>
                )}
                {!isCorrect && question.explanation && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {assessment.weakAreas?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Areas to Improve
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              {assessment.weakAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetails;
