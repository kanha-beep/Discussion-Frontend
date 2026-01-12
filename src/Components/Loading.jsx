import React from "react";

export function Loading({ loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        ) : null}
        <div className="text-gray-500">Loading subjects...</div>
      </div>
    );
  }
  return;
}
