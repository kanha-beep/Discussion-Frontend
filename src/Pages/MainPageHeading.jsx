import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { UserContext } from "../Components/UserContext";

export function MainPageHeading({ user, onExploreMore, isVisible = true }) {
  const { setFilterDiscussion } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const searchKey = async () => {
      try {
        const res = await api.get(`/api/discussion?search=${search}`);
        setFilterDiscussion(res?.data?.discussions);
      } catch (e) {
        console.log(e?.response?.data);
      }
    };

    searchKey();
  }, [search, setFilterDiscussion]);

  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        className={`overflow-hidden transform transition-all duration-500 ease-in-out
  ${
    isVisible
      ? "max-h-[700px] opacity-100 translate-y-0 mb-0 pointer-events-auto"
      : "max-h-0 opacity-0 -translate-y-10 -mb-8 pointer-events-none"
  }`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <h1 className="hero-1">
          Ask • <b style={{ color: "#283E4A" }}>Discuss</b> • Learn
        </h1>

        <p className="hero-2">
          A modern discussion hub where learners, developers, and thinkers ask
          questions,
          <br />
          share knowledge, and grow together.
        </p>

        <div className="search-section">
          <input
            type="search"
            placeholder="Search questions, topics, or users..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center justify-center gap-4 flex-wrap mx-auto">
          <button
            className="button-2"
            onClick={() =>
              navigate("/discussion-form", {
                state: { user, edit: false },
              })
            }
          >
            Create Discussion
          </button>
          <button className="button-2" onClick={onExploreMore}>
            Explore More
          </button>
        </div>
      </div>
    </div>
  );
}
