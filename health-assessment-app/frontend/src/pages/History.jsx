import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { supabase } from '../supabaseClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      // Generate mock data for demonstration
      setHistory(generateMockHistory());
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = () => {
    const dates = [];
    const scores = [];
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      dates.push(date.toISOString());
      scores.push(Math.floor(Math.random() * 30) + 60);
    }

    return dates.map((date, index) => ({
      id: index + 1,
      created_at: date,
      health_score: scores[index],
      risk_level: scores[index] > 75 ? 'Low' : scores[index] > 50 ? 'Moderate' : 'High'
    }));
  };

  const chartData = {
    labels: history.map(item => new Date(item.created_at).toLocaleDateString()),
    datasets: [{
      label: 'Health Score Over Time',
      data: history.map(item => item.health_score),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-800">Assessment History</h1>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center"
          >
            <div className="py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assessments Yet</h3>
              <p className="text-gray-500 mb-6">Take your first assessment to see your health trends over time</p>
              <button onClick={() => navigate('/assessment')} className="btn-primary">
                Start Assessment
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Score Trend</h2>
              <Line data={chartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                  tooltip: { enabled: true }
                },
                scales: {
                  y: { beginAtZero: true, max: 100 }
                }
              }} />
            </motion.div>

            {/* Assessment Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="card hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(item.risk_level)}`}>
                      {item.risk_level}
                    </span>
                  </div>
                  
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {Math.round(item.health_score)}%
                    </div>
                    <p className="text-gray-600">Health Score</p>
                  </div>

                  <div className="progress-bar mb-2">
                    <div 
                      className="progress-fill"
                      style={{ width: `${item.health_score}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default History;
