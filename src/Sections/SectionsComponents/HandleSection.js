export const HandleSections = async (openChapterId, chapterId, setOpenChapterId, setSectionsList, api, _id) => {
    try {
        // console.log("chapter id working: ", chapterId);

        if (openChapterId === chapterId) {
            setOpenChapterId(null); // close
            setSectionsList([]); // clear
            return;
        }
        const res = await api.get(
            `/subjects/${_id}/chapters/${chapterId}/sections`
        );
        // console.log("Sections: ", res?.data?.sections);
        setSectionsList(res?.data?.sections || []);
        setOpenChapterId(chapterId);
    } catch (e) {
        console.log("error in sections: ", e?.response?.data);
    }
};