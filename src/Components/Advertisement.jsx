import React from "react";
import { useEffect } from "react";
import { api } from "../../api";
import { Link } from "react-router-dom";
export default function Advertisement() {
  const [newsList, setNewsList] = React.useState([]);
  useEffect(() => {
    console.log("Advertisement mounted");
    const getNews = async () => {
      try {
        const res = await api.get("/api/discussion/news");
        console.log("NEWS: ", res?.data);
        setNewsList(res?.data || []);
      } catch (err) {
        console.log(
          "error fetching news: ",
          err.response?.data?.msg || err.message,
        );
      }
    };
    getNews();
  }, []);
  return (
    <div>
      <h2 className="news-title">LATEST NEWS</h2>
      <ul className="news overflow-y-auto h-[20rem]">
        {newsList.slice(0, 3).map((news, index) => (
          <li className="news-1 bg-green mb-5" key={index}>
            <span className="fs-6">
              {news?.title || "No news available"}
              <br></br>
              <a
                href={news?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-time"
              >
                Read News
              </a>
            </span>
          </li>
        ))}
        <span className="show-news">Show More</span>
      </ul>
    </div>
  );
}
