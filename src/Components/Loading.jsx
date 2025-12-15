import React from "react";

export function Loading({ loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading subjects...</div>
      </div>
    );
  }
  return;
}
