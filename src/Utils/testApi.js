import { api } from "../../api";

export const testApi = {
  getTests: async () => {
    const res = await api.get("/api/tests");
    return res?.data || [];
  },
  getTest: async (id) => {
    const res = await api.get(`/api/tests/${id}`);
    return res?.data;
  },
  generateTest: async (prompt) => {
    const res = await api.post("/api/tests/generate", { prompt });
    return res?.data;
  },
  getSubmissions: async (candidateName = "") => {
    const params = candidateName?.trim() ? { candidateName: candidateName.trim() } : {};
    const res = await api.get("/api/tests/submissions", { params });
    return res?.data || [];
  },
  submitTest: async (id, body) => {
    const res = await api.post(`/api/tests/${id}/submissions`, body);
    return res?.data;
  },
  getSubmission: async (id) => {
    const res = await api.get(`/api/tests/submissions/${id}`);
    return res?.data;
  },
};
