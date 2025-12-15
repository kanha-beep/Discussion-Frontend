export const EditSection = async (api, _id, chapterId, sectionId) => {
    console.log(
        "Edit content for chapterId:",
        chapterId,
        "sectionId:",
        sectionId
    );
    const res = await api.get(
        `/subjects/${_id}/chapters/${chapterId}/sections/${sectionId}/edit`
    );
    console.log("Edit content response: ", res?.data);
};