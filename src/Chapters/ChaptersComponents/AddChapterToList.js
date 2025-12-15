export const AddChapterToList = (chapterName, setChaptersList, chaptersList, setChapterName) => {
    console.log("Adding chapter: ", chapterName);
    if (!chapterName.trim()) return;
    setChaptersList((prev) => [...prev, chapterName]);
    console.log("chaptersList: ", chaptersList);
    // setSectionInput("");
    setChapterName("");
};