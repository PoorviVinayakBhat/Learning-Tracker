import client from "./client";

// Auth
export const registerUser = (data) => client.post("/auth/register", data);
export const loginUser = (data) => client.post("/auth/login", data);

// Topics
export const getTopics = () => client.get("/topics");
export const getTopic = (id) => client.get(`/topics/${id}`);
export const createTopic = (data) => client.post("/topics", data);
export const updateTopic = (id, data) => client.put(`/topics/${id}`, data);
export const deleteTopic = (id) => client.delete(`/topics/${id}`);

// Resources
export const getResources = (topicId) =>
  client.get("/resources", { params: topicId ? { topicId } : {} });
export const getResource = (id) => client.get(`/resources/${id}`);
export const createResource = (data) => client.post("/resources", data);
export const updateResource = (id, data) => client.put(`/resources/${id}`, data);
export const deleteResource = (id) => client.delete(`/resources/${id}`);
export const markReviewed = (id) => client.post(`/resources/${id}/review`);

// AI
export const summarizeResource = (id) => client.post(`/ai/resources/${id}/summarize`);
export const generateQuiz = (id, numQuestions = 5) =>
  client.post(`/ai/resources/${id}/quiz`, null, { params: { numQuestions } });
export const getQuizzesForResource = (id) => client.get(`/ai/resources/${id}/quizzes`);
export const submitQuiz = (quizId, answers) =>
  client.post(`/ai/quizzes/${quizId}/submit`, { answers });

// Decay radar
export const getDecayRadar = () => client.get("/decay-radar");

// Revision planner
export const getTodayPlan = () => client.get("/revision-planner/today");

// Search
export const searchResources = (q) => client.get("/search", { params: { q } });

// Dashboard
export const getDashboard = () => client.get("/dashboard");
