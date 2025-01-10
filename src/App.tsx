import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, MessageSquare, ArrowUp } from 'lucide-react';
import axios from 'axios';
import { RedditPost, SearchParams, RedditApiResponse, AccessTokenResponse } from './types';

function App() {
    const [searchParams, setSearchParams] = useState<SearchParams>({
        subreddit: '',
        keyword: ''
    });
    const [posts, setPosts] = useState<RedditPost[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [debouncedSearchParams, setDebouncedSearchParams] = useState<SearchParams>(searchParams);
    const [noResults, setNoResults] = useState<boolean>(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

    // Replace these with your actual Reddit API credentials
    // Ideally, these should be in environment variables
    const clientId = 'cUJsAJkD8t-lnJOZgV0qow';
    const clientSecret = 'M0arYEozx1M0M-D6gKfaMnX3Z4Mgrg';

    // Debounce the search parameters
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchParams(searchParams);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchParams]);

    const getAccessToken = async () => {
        try {
            const response = await axios.post<AccessTokenResponse>(
                'https://www.reddit.com/api/v1/access_token',
                'grant_type=client_credentials',
                {
                    auth: {
                        username: clientId,
                        password: clientSecret
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const newToken = response.data.access_token;
            const expiryTime = Date.now() + (response.data.expires_in * 1000);
            setAccessToken(newToken);
            setTokenExpiry(expiryTime);
            return newToken;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    };

    const getValidAccessToken = async () => {
        if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
            return getAccessToken();
        }
        return accessToken;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            if (!debouncedSearchParams.subreddit || !debouncedSearchParams.keyword) {
                setPosts([]);
                setNoResults(false);
                return;
            }

            setLoading(true);
            setError(null);
            setNoResults(false);

            try {
                const token = await getValidAccessToken();

                const response = await axios.get<RedditApiResponse>(
                    `https://oauth.reddit.com/r/${debouncedSearchParams.subreddit}/search`,
                    {
                        params: {
                            q: debouncedSearchParams.keyword,
                            sort: 'new',
                            restrict_sr: 1,
                            t: 'all',
                            limit: 25
                        },
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'User-Agent': 'my-reddit-search-bot v1.0'
                        }
                    }
                );

                if (response.data && response.data.data && response.data.data.children) {
                    const formattedPosts: RedditPost[] = response.data.data.children.map(child => ({
                        id: child.data.id,
                        title: child.data.title,
                        selftext: child.data.selftext,
                        author: child.data.author,
                        created_utc: child.data.created_utc,
                        score: child.data.score,
                        num_comments: child.data.num_comments,
                        permalink: child.data.permalink
                    }));
                    setPosts(formattedPosts);
                    setNoResults(formattedPosts.length === 0);
                } else {
                    setPosts([]);
                    setNoResults(true);
                }
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch posts.';
                setError(errorMessage);
                setPosts([]);
                setNoResults(true);
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();

        // Setup Polling
        const intervalId = setInterval(fetchPosts, 60000); // Poll every 60 seconds
        return () => clearInterval(intervalId);
    }, [debouncedSearchParams]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Reddit Search Engine
                    </h1>
                    <p className="text-lg text-gray-300">
                        Search for specific content within your favorite subreddits
                    </p>
                </div>

                <form className="max-w-3xl mx-auto mb-12" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">r/</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder="subreddit"
                                    value={searchParams.subreddit}
                                    onChange={(e) =>
                                        setSearchParams(prev => ({ ...prev, subreddit: e.target.value }))
                                    }
                                    className="block w-full pl-8 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    onChange={(e) =>
                                        setSearchParams(prev => ({ ...prev, keyword: e.target.value }))
                                    }
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {loading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    </div>
                )}
                
                {error && (
                    <div className="max-w-3xl mx-auto mb-8 bg-red-900/50 border border-red-500 rounded-md p-4 text-center text-red-200">
                        {error}
                    </div>
                )}
                
                {noResults && !loading && !error && (
                    <div className="text-center text-gray-400 py-4">
                        No results found for your search
                    </div>
                )}

                <div className="max-w-3xl mx-auto space-y-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-6 transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    {post.title}
                                </h2>
                                <a
                                    href={`https://reddit.com${post.permalink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <ArrowUpRight className="h-5 w-5" />
                                </a>
                            </div>
                            <p className="text-gray-400 mb-4 line-clamp-3">
                                {post.selftext}
                            </p>
                            <div className="flex items-center text-sm text-gray-400 space-x-4">
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