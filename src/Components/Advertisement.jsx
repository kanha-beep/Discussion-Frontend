import React from "react";
import { useEffect } from "react";
import { api } from "../../api";
import { XMLParser } from "fast-xml-parser";
export default function Advertisement() {
  useEffect(() => {
    const getNews = async () => {
      const res = await api.get("https://pib.gov.in/rss.aspx");
      console.log("new: ", res?.data);
    };
    getNews()
  }, []);
  return (
    <div>
      {" "}
      <h2 className="news-title">LATEST NEWS</h2>
      <ul className="news">
        <span className="dot-tech">
          •
          <li className="news-1">
            <span className="suggest-1">
              Suggestions<p className="news-time">2h ago</p>
            </span>
          </li>
        </span>
        <span className="dot-tech">
          •
          <li className="news-1">
            <span className="suggest-1">
              Suggestions<p className="news-time">time</p>
            </span>
          </li>
        </span>
        <span className="dot-tech">
          •
          <li className="news-1">
            <span className="suggest-1">
              Suggestions<p className="news-time">time</p>
            </span>
          </li>
        </span>
        <span className="show-news">Show More</span>
      </ul>
    </div>
  );
}
