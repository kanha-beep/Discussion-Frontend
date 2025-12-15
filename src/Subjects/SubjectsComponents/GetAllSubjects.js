export const GetAllSubjects = async (api, setSubjects, setLoading) => {
    try {
        const res = await api.get("/subjects");
        console.log("Fetched subjects:", res?.data?.subjects);
        setSubjects(res?.data?.subjects || []);
        console.log("total subjects:", res?.data?.count);
    } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjects([]);
    } finally {
        setLoading(false);
    }
};