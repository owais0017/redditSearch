import React, { useState } from 'react';
import { Search, ArrowUpRight, MessageSquare, ArrowUp } from 'lucide-react';

// Mock data for display
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Example Post Title 1',
    selftext: 'This is an example post content that shows how the layout works. It can contain multiple lines of text and will be truncated if it gets too long.',
    author: 'username1',
    created_utc: Date.now() / 1000 - 3600, // 1 hour ago
    score: 142,
    num_comments: 23,
    permalink: '/r/example/comments/123/example_post'
  },
  {
    id: '2',
    title: 'Example Post Title 2',
    selftext: 'Another example post with different content to show variation in the layout.',
    author: 'username2',
    created_utc: Date.now() / 1000 - 7200, // 2 hours ago
    score: 89,
    num_comments: 15,
    permalink: '/r/example/comments/456/example_post'
  }
];

function App() {
  const [searchParams, setSearchParams] = useState({
    subreddit: '',
    keyword: ''
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reddit Search Engine
          </h1>
          <p className="text-lg text-gray-600">
            Search for specific content within your favorite subreddits
          </p>
        </div>

        <form className="max-w-3xl mx-auto mb-12" onSubmit={(e) => e.preventDefault()}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">r/</span>
                </span>
                <input
                  type="text"
                  placeholder="subreddit"
                  value={searchParams.subreddit}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, subreddit: e.target.value }))}
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search keyword"
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </button>
        </form>

        <div className="max-w-3xl mx-auto space-y-6">
          {MOCK_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <a
                  href={`https://reddit.com${post.permalink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.selftext}
              </p>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>Posted by u/{post.author}</span>
                <span>•</span>
                <span>{formatDate(post.created_utc)}</span>
                <span className="flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {post.score}
                </span>
                <span className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.num_comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;