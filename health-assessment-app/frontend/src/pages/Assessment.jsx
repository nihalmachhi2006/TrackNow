import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { submitAssessment, getHealthQuestions } from '../services/api';

const defaultQuestions = [
  {
    id: 1,
    question: "How many hours do you sleep on average per night?",
    options: [
      { value: "less_than_5", label: "Less than 5 hours", score: 3 },
      { value: "5_to_6", label: "5-6 hours", score: 2 },
      { value: "7_to_8", label: "7-8 hours", score: 0 },
      { value: "more_than_8", label: "More than 8 hours", score: 1 }
    ]
  },
  {
    id: 2,
    question: "How often do you exercise per week?",
    options: [
      { value: "never", label: "Never", score: 3 },
      { value: "1_to_2", label: "1-2 times", score: 2 },
      { value: "3_to_4", label: "3-4 times", score: 1 },
      { value: "5_or_more", label: "5 or more times", score: 0 }
    ]
  },
  {
    id: 3,
    question: "How would you rate your stress level?",
    options: [
      { value: "very_high", label: "Very High", score: 3 },
      { value: "high", label: "High", score: 2 },
      { value: "moderate", label: "Moderate", score: 1 },
      { value: "low", label: "Low", score: 0 }
    ]
  },
  {
    id: 4,
    question: "How many servings of fruits and vegetables do you eat daily?",
    options: [
      { value: "none", label: "None or rarely", score: 3 },
      { value: "1_to_2", label: "1-2 servings", score: 2 },
      { value: "3_to_4", label: "3-4 servings", score: 1 },
      { value: "5_or_more", label: "5 or more servings", score: 0 }
    ]
  },
  {
    id: 5,
    question: "Do you have any existing health conditions?",
    options: [
      { value: "multiple", label: "Multiple conditions", score: 3 },
      { value: "one", label: "One condition", score: 2 },
      { value: "none_managed", label: "None, but family history", score: 1 },
      { value: "none", label: "None", score: 0 }
    ]
  }
];

const Assessment = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch questions from backend, fallback to default
    getHealthQuestions()
      .then(data => {
        if (data && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch(() => {
        console.log('Using default questions');
      });
  }, []);

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitAssessment(answers);
      navigate('/results', { state: { results: result } });
    } catch (error) {
      console.error('Error:', error);
      // Calculate results locally if backend fails
      const totalScore = Object.values(answers).reduce((sum, ans) => sum + ans.score, 0);
      const maxScore = questions.length * 3;
      const percentage = ((maxScore - totalScore) / maxScore) * 100;
      
      navigate('/results', { state: { 
        results: {
          health_score: percentage,
          risk_level: percentage > 75 ? 'Low' : percentage > 50 ? 'Moderate' : 'High',
          answers: answers
        }
      }});
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const isAnswered = answers[question.id] !== undefined;
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card max-w-3xl w-full"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {question.question}
            </h2>

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    answers[question.id]?.value === option.value
                      ? 'border-primary bg-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[question.id]?.value === option.value
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {answers[question.id]?.value === option.value && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{option.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered || loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                !isAnswered || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                !isAnswered
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              Next Question
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Assessment;
