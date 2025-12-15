export const AddSection = async (e, sections, api, subjectId, chapterId, setSections, navigate) => {
    e.preventDefault();
    console.log("sections ready: ", sections);
    try {
        const res = await api.post(
            `/subjects/${subjectId}/chapters/${chapterId}/sections/add-section`,
            sections
        );
        console.log("response after adding sections: ", res);
        setSections({ sectionName: "", sectionContent: "" });
        navigate(`/subjects/${subjectId}`);
    } catch (e) {
        console.error("Error adding section: ", e?.response?.data?.msg);
    }
};