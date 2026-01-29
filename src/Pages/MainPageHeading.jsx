import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function MainPageHeading({ user }) {
  const [scrolled, setScrolled] = useState(false); // ✅ NEW
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navigate = useNavigate();
  return (
    <div>
      <div className="hero">
        <h1 className="hero-1">
          Ask • <b style={{ color: "#283E4A" }}>Discuss</b> • Learn
        </h1>

        <p className="hero-2">
          A modern discussion hub where learners, developers, and thinkers ask
          questions,
          <br />
          share knowledge, and grow together.
        </p>

        {/* 🔍 Search Section */}
        <div className="search-section">
          <input
            type="search"
            placeholder="Search questions, topics, or users..."
            className="search-input"
          />
        </div>
        <div className="button" style={{ marginLeft: "10rem" }} >
          <button
            className={`logo ${scrolled ? "logo-scrolled" : ""} button-2`}
            onClick={() =>
              navigate("/discussion-form", {
                state: { user, edit: false },
              })
            }
          >
            Create Discussion
          </button>
          <button className="button-2">
            <span className="button">Explore More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
