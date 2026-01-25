import React from 'react';

export default function PostLayout({ title, children }) {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 md:px-16">
        <a href="/blog" className="font-mono text-emerald-500 text-sm mb-6 inline-block hover:underline uppercase tracking-widest" aria-label="Back to Blog">← Back to Blog</a>
        
        <h1 className="text-4xl md:text-5xl font-semibold text-white mb-8 tracking-tight">{title}</h1>
        
        <div className="prose prose-invert prose-emerald max-w-none text-neutral-400 leading-relaxed text-lg">
            {/* 'children' here will be the rendered Markdown HTML */}
            {children}
        </div>
    </div>
  );
}
