export default function SectionsSummary({ sectionsList, sectionContent }) {
  // console.log(" in ChapterSummary: ", sectionsList);
  return (
    <div className="row border rounded">
      <h3 className="">Summary</h3>
      {sectionsList.length > 0 && (
        <div className="border rounded mt-4">
          {sectionContent && (
            <div
              className="mt-3"
              dangerouslySetInnerHTML={{ __html: sectionContent }}
            />
          )}
        </div>
      )}
    </div>
  );
}
