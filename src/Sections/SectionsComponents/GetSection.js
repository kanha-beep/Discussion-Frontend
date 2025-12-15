export const GetSection = async (api, subjectId, chapterId, sectionId, setSectionData) => {
    try {
        const res = await api.get(
            `/subjects/${subjectId}/chapters/${chapterId}/sections/${sectionId}`
        );
        console.log("Section data for editing: ", res?.data?.section);
        setSectionData({
            sectionName: res?.data?.section?.section_name || "",
            //   sectionContent: (res?.data?.section?.section_content || []).join("."),
            //   sectionContent:res?.data?.section?.section_content.join(". ") || "",
            sectionContent: (res?.data?.section?.section_content || [])
                .map((s) => s.trim())
                .join("\n"),
        });
    } catch (err) {
        console.error("Error fetching section data: ", err?.response?.data);
    }
};