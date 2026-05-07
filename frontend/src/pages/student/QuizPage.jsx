import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { quizService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startedAt] = useState(new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    quizService.getQuiz(quizId)
      .then(({ data }) => {
        setQuiz(data.quiz);
        if (data.quiz.timeLimit > 0) setTimeLeft(data.quiz.timeLimit * 60);
      })
      .catch(() => { toast.error('Quiz not found'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const handleAnswer = (questionId, optionId) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    clearTimeout(timerRef.current);
    setSubmitted(true);

    const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    try {
      const { data } = await quizService.submitQuiz(quizId, {
        answers: formattedAnswers,
        startedAt,
        timeTaken: quiz.timeLimit > 0 ? quiz.timeLimit * 60 - (timeLeft || 0) : undefined,
      });
      setResult(data.result);
    } catch (err) {
      toast.error('Failed to submit quiz');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!quiz) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{answeredCount}/{totalQuestions} answered</p>
          </div>
          {timeLeft !== null && !submitted && (
            <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-500' : 'text-foreground'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 mb-6 text-center ${result.passed ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' : 'bg-red-50 dark:bg-red-950/20 border border-red-200'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {result.passed ? <Trophy className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
            </div>
            <h2 className="text-2xl font-bold mb-1">{result.passed ? 'Congratulations!' : 'Keep Trying!'}</h2>
            <p className="text-muted-foreground mb-3">
              You scored <strong>{result.percentage}%</strong> ({result.score}/{result.totalPoints} points)
            </p>
            <p className="text-sm text-muted-foreground">
              Passing score: {result.passingScore}% • Attempt #{result.attemptNumber}
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => navigate(-1)} className="btn-secondary">Back to Course</button>
              {!result.passed && (
                <button onClick={() => { setSubmitted(false); setResult(null); setAnswers({}); }} className="btn-primary">
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {quiz.questions.map((q, idx) => {
            const userAnswer = answers[q._id];
            const resultAnswer = result?.answers?.find((a) => a.question?.toString() === q._id?.toString());

            return (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-7 h-7 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="font-medium">{q.question}</p>
                </div>

                <div className="space-y-2 ml-10">
                  {q.options.map((option) => {
                    const isSelected = userAnswer === option._id;
                    const isCorrect = result && resultAnswer?.isCorrect && isSelected;
                    const isWrong = result && !resultAnswer?.isCorrect && isSelected;
                    const isCorrectAnswer = result && result.answers && resultAnswer && !resultAnswer.isCorrect && option._id === resultAnswer.correctOption?._id;

                    return (
                      <button
                        key={option._id}
                        onClick={() => handleAnswer(q._id, option._id)}
                        disabled={submitted}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                          isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700'
                          : isWrong ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700'
                          : isCorrectAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700'
                          : isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 text-brand-700'
                          : 'border-border hover:border-brand-300 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          {isWrong && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          {option.text}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {result && resultAnswer?.explanation && (
                  <div className="mt-3 ml-10 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    💡 {resultAnswer.explanation}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Submit button */}
        {!submitted && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
            >
              Submit Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
