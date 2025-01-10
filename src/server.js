// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

// Store the access token and its expiration
let accessToken = null;
let tokenExpiry = null;

// Function to get a new access token
async function getAccessToken() {
    try {
        const response = await axios.post(
            'https://www.reddit.com/api/v1/access_token',
            'grant_type=client_credentials',
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        accessToken = response.data.access_token;
        // Set expiry to slightly before actual expiry to ensure token validity
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
        return accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Middleware to ensure we have a valid token
async function ensureValidToken(req, res, next) {
    try {
        if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
            await getAccessToken();
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to authenticate with Reddit' });
    }
}

// Search endpoint
app.get('/api/search', ensureValidToken, async (req, res) => {
    try {
        const { subreddit, keyword, sort = 'new', time = 'all', limit = 25 } = req.query;

        if (!subreddit || !keyword) {
            return res.status(400).json({ error: 'Subreddit and keyword are required' });
        }

        const response = await axios.get(
            `https://oauth.reddit.com/r/${subreddit}/search`,
            {
                params: {
                    q: keyword,
                    sort,
                    restrict_sr: 1,
                    t: time,
                    limit
                },
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'MyRedditSearchApp/1.0.0'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to fetch search results'
        });
    }
});

// Subreddit info endpoint
app.get('/api/subreddit/:subreddit', ensureValidToken, async (req, res) => {
    try {
        const { subreddit } = req.params;
        
        const response = await axios.get(
            `https://oauth.reddit.com/r/${subreddit}/about`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'MyRedditSearchApp/1.0.0'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Subreddit info error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to fetch subreddit information'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});