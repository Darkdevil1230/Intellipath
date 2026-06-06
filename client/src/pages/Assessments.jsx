import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

const Assessments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('');
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const { data: history } = useQuery({
    queryKey: ['assessment-history'],
    queryFn: () => api.get('/assessment/history').then(res => res.data),
  });

  const generateMutation = useMutation({
    mutationFn: (data) => api.post('/assessment/generate', data),
    onSuccess: (data) => {
      setCurrentAssessment(data);
      setAnswers({});
      setShowResults(false);
      toast.success('Assessment generated!');
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data) => api.post('/assessment/submit', data),
    onSuccess: (data) => {
      setCurrentAssessment(data);
      setShowResults(true);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Assessment submitted! Great work.');
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    generateMutation.mutate({ topic });
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = () => {
    const answerArray = currentAssessment.questions.map((_, index) => answers[index]);
    submitMutation.mutate({
      assessmentId: currentAssessment._id,
      answers: answerArray,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Assessments
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Test your knowledge with AI-generated quizzes.
        </p>
      </div>

      <div className="card">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., JavaScript, Machine Learning, React)"
            className="flex-1 input-field"
          />
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isLoading}
            className="btn-primary flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Generate Quiz
          </button>
        </div>
      </div>

      {currentAssessment && !showResults && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {currentAssessment.title}
          </h2>
          <div className="space-y-6">
            {currentAssessment.questions.map((question, qIndex) => (
              <div key={qIndex} className="space-y-3">
                <p className="text-gray-900 dark:text-white font-medium">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        answers[qIndex] === oIndex
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={oIndex}
                        checked={answers[qIndex] === oIndex}
                        onChange={() => handleAnswer(qIndex, oIndex)}
                        className="mr-3"
                      />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isLoading || Object.keys(answers).length < currentAssessment.questions.length}
            className="btn-primary w-full mt-6"
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      )}

      {currentAssessment && showResults && (
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assessment Results
            </h2>
            <div className="mt-4">
              <span className="text-5xl font-bold text-primary-600">
                {currentAssessment.score.toFixed(0)}%
              </span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {currentAssessment.score >= 70 ? 'Great job!' : 'Keep practicing!'}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {currentAssessment.questions.map((question, qIndex) => {
              const userAnswer = currentAssessment.userAnswers[qIndex];
              return (
                <div
                  key={qIndex}
                  className={`p-4 rounded-lg ${
                    userAnswer.isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {qIndex + 1}. {question.question}
                    </p>
                    {userAnswer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className="text-red-600 font-bold">✗</span>
                    )}
                  </div>
                  {!userAnswer.isCorrect && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {currentAssessment.weakAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Areas to Improve
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                {currentAssessment.weakAreas.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setCurrentAssessment(null)}
            className="btn-secondary w-full"
          >
            Take Another Assessment
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Assessment History
        </h2>
        <div className="space-y-3">
          {history?.map((assessment) => (
            <div
              key={assessment._id}
              role="button"
              tabIndex={0}
              onClick={() => {
                console.log('[Assessments] clicked assessment id:', assessment._id);
                navigate(`/assessments/${assessment._id}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  console.log('[Assessments] clicked assessment id:', assessment._id);
                  navigate(`/assessments/${assessment._id}`);
                }
              }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{assessment.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(assessment.completedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                {assessment.score.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
