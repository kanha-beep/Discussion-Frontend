export const DeleteChapter = async (api, chapterId, setChaptersList) => {
    try {
        console.log("dlete started")
        const res = await api.delete(`/chapters/${chapterId}`);
        setChaptersList(prevChapters => prevChapters.filter(chapter => chapter._id !== chapterId));
        console.log("Chapter deleted:", res?.data?.msg);
    } catch (error) {
        console.error("Error deleting chapter:", error?.response?.data?.msg);
    }
}