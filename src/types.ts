export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  permalink: string;
  subreddit?: string;
  url?: string;
  thumbnail?: string;
  is_self?: boolean;
  upvote_ratio?: number;
  distinguished?: string | null;
  stickied?: boolean;
}

// Interface for search parameters
export interface SearchParams {
  subreddit: string;
  keyword: string;
}

// Interface for Reddit's API response structure
export interface RedditApiResponse {
  kind: string;
  data: {
      after: string | null;
      before: string | null;
      dist: number;
      children: {
          kind: string;
          data: RedditPost;
      }[];
      modhash: string;
  };
}

// Interface for Reddit's OAuth token response
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Interface for API error response
export interface RedditApiError {
  message: string;
  error: number;
  details?: string;
}

// Interface for API request options
export interface ApiRequestOptions {
  sort?: 'new' | 'hot' | 'top' | 'relevance';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  after?: string;
  before?: string;
}

// Enum for possible search result sorting options
export enum SearchSort {
  New = 'new',
  Hot = 'hot',
  Top = 'top',
  Relevance = 'relevance'
}

// Enum for possible time filters
export enum TimeFilter {
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
  All = 'all'
}

// Type for the search state
export type SearchState = {
  isLoading: boolean;
  error: string | null;
  hasResults: boolean;
  totalResults: number;
};