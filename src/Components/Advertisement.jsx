import React from "react";

export default function Advertisement() {
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
