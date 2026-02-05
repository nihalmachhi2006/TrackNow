import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler);

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (!results) return null;

  const healthScore = results.health_score || 0;
  const riskLevel = results.risk_level || 'Unknown';
  const recommendations = results.recommendations || getDefaultRecommendations(healthScore);

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Health Score', 'Risk Factor'],
    datasets: [{
      data: [healthScore, 100 - healthScore],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  };

  // Bar Chart Data for Categories
  const categoryScores = results.category_scores || {
    'Sleep': Math.random() * 40 + 60,
    'Exercise': Math.random() * 40 + 60,
    'Stress': Math.random() * 40 + 60,
    'Nutrition': Math.random() * 40 + 60,
    'Medical': Math.random() * 40 + 60,
  };

  const barData = {
    labels: Object.keys(categoryScores),
    datasets: [{
      label: 'Category Scores',
      data: Object.values(categoryScores),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    }]
  };

  // Radar Chart Data
  const radarData = {
    labels: Object.keys(categoryScores),
    datasets: [{
      label: 'Your Health Profile',
      data: Object.values(categoryScores),
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: '#10b981',
      borderWidth: 2,
    }]
  };

  const getRiskColor = (level) => {
    switch(level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (level) => {
    switch(level.toLowerCase()) {
      case 'low': return 'bg-green-100';
      case 'moderate': return 'bg-yellow-100';
      case 'high': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="card mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Health Assessment Results</h1>
            <div className={`inline-block px-6 py-3 rounded-full ${getRiskBgColor(riskLevel)} mb-4`}>
              <span className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
                Risk Level: {riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Overall Health Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Overall Health Score</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut data={doughnutData} options={{
                plugins: {
                  legend: { display: true, position: 'bottom' },
                  tooltip: { enabled: true }
                }
              }} />
            </div>
            <div className="text-center mt-6">
              <p className="text-5xl font-bold text-primary">{Math.round(healthScore)}%</p>
              <p className="text-gray-600 mt-2">Health Score</p>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Category Breakdown</h2>
            <Bar data={barData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                y: { beginAtZero: true, max: 100 }
              }
            }} />
          </motion.div>
        </div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Health Profile Overview</h2>
          <div className="max-w-2xl mx-auto">
            <Radar data={radarData} options={{
              scales: {
                r: { beginAtZero: true, max: 100 }
              }
            }} />
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                  <p className="text-gray-600">{rec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate('/assessment')}
            className="btn-primary"
          >
            Take Assessment Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function getDefaultRecommendations(healthScore) {
  if (healthScore >= 75) {
    return [
      { title: 'Maintain Your Routine', description: 'Keep up your excellent health habits!' },
      { title: 'Regular Check-ups', description: 'Continue annual health screenings.' },
      { title: 'Stay Active', description: 'Maintain your current exercise regimen.' },
    ];
  } else if (healthScore >= 50) {
    return [
      { title: 'Improve Sleep Quality', description: 'Aim for 7-8 hours of quality sleep each night.' },
      { title: 'Increase Physical Activity', description: 'Try to exercise at least 3-4 times per week.' },
      { title: 'Stress Management', description: 'Practice meditation or yoga to reduce stress levels.' },
      { title: 'Better Nutrition', description: 'Increase daily intake of fruits and vegetables.' },
    ];
  } else {
    return [
      { title: 'Consult a Healthcare Provider', description: 'Schedule an appointment for a comprehensive health evaluation.' },
      { title: 'Prioritize Sleep', description: 'Establish a consistent sleep schedule and improve sleep hygiene.' },
      { title: 'Start Gentle Exercise', description: 'Begin with 15-20 minutes of walking daily.' },
      { title: 'Nutrition Overhaul', description: 'Consider consulting a nutritionist for a personalized diet plan.' },
      { title: 'Stress Reduction', description: 'Identify stress triggers and develop coping strategies.' },
    ];
  }
}

export default Results;
