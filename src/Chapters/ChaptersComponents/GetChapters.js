export const GetChapters = async (api,_id, setChapterCount, setSubjectName, setChaptersList) => {
    try {
        const res = await api.get(`/subjects/${_id}/chapters`);
        setChapterCount(res?.data?.chaptersCount || 0);
        setSubjectName(res?.data?.subjectName?.subject_name || "");
        setChaptersList(res?.data?.chaptersList || []);
    } catch (error) {
        console.error("Error fetching chapters:", error?.response?.data?.msg);
        setChaptersList([]);
    }
};