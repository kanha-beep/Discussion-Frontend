export const UpdateSection = async (e, api, subjectId, chapterId, sectionId, sectionData, navigate) => {
    e.preventDefault();
    try {
        const res = await api.patch(
            `/subjects/${subjectId}/chapters/${chapterId}/sections/${sectionId}/edit`,
            {
                sectionName: sectionData.sectionName,
                sectionContent: sectionData.sectionContent,
            }
        );
        console.log("Section updated successfully: ", res?.data);
        navigate(`/subjects/${subjectId}`);
    } catch (err) {
        console.error("Error updating section: ", err?.response?.data);
    }
};