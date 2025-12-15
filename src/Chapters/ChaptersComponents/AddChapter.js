export const AddChapter = async (chaptersList, api, subjectId, setChaptersList, setChapterName, navigate) => {
    if (chaptersList.length === 0) return alert("Add at least one chapter");
    try {
        const res = await api.post(
            `/subjects/${subjectId}/chapters/add-chapters`,
            {
                subjectId: subjectId,
                chapters: chaptersList,
                //   sectionsList: sectionsList,
                //   sectionContent: sectionContent,
            }
        );
        console.log("Response:", res.data);
        setChaptersList([]);
        setChapterName("");
        alert("Chapters added successfully");
        navigate(`/subjects/${subjectId}`);
    } catch (e) {
        console.error("Error:", e?.response?.data?.msg);
        alert("Failed to add chapters");
    }
};