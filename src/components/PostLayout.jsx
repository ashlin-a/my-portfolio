import React from 'react';

export default function PostLayout({ title, children }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">{title}</h1>
      <div className="prose prose-lg text-gray-700">
        {/* 'children' here will be the rendered Markdown HTML */}
        {children}
      </div>
    </div>
  );
}