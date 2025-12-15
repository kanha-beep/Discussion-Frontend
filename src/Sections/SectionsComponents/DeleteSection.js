export const DeleteSection = async (api, _id, chapterId, sectionId, getChapters, setSectionsList) => {
    console.log(
        "Deleting section with ID:",
        sectionId,
        "from chapter ID:",
        chapterId
    );
    const res = await api.delete(
        `/subjects/${_id}/chapters/${chapterId}/sections/${sectionId}/delete`
    );
    console.log("Delete response: ", res?.data);
    getChapters();
    setSectionsList((prevSections) =>
        prevSections.filter((section) => section._id !== sectionId)
    );
};