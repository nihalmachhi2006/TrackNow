import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '  ';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitAssessment = async (answers) => {
  try {
    const response = await api.post('/assessment', { answers });
    return response.data;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw error;
  }
};

export const getAssessmentHistory = async (userId) => {
  try {
    const response = await api.get(`/assessment/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

export const getHealthQuestions = async () => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export default api;
