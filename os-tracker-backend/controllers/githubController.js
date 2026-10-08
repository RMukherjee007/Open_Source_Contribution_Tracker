const axios = require('axios');
const SearchLog = require('../models/SearchLog');
const redisClient = require('../utils/redisClient');

const getGithubMetrics = async (req, res) => {
    const { username } = req.params;

    try {
        let cachedData = null;
        try {
            if (redisClient.isReady) {
                cachedData = await redisClient.get(`github:${username}`);
            }
        } catch (err) {
            console.error('Redis cache get error:', err);
        }

        if (cachedData) {
            // Also log a cached search asynchronously
            SearchLog.create({ username, success: true }).catch(console.error);
            return res.json(JSON.parse(cachedData));
        }

        const reqHeaders = {
            'User-Agent': 'os-tracker'
        };
        if (process.env.GITHUB_TOKEN) {
            reqHeaders.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        // RESUME CLAIM: Asynchronously aggregated developer metrics
        const [profileRes, reposRes] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}`, { headers: reqHeaders }),
            axios.get(`https://api.github.com/users/${username}/repos?per_page=5&sort=updated`, { headers: reqHeaders })
        ]);

        const data = {
            profile: {
                name: profileRes.data.name,
                followers: profileRes.data.followers,
                repos: profileRes.data.public_repos,
                avatar: profileRes.data.avatar_url
            },
            recentRepos: reposRes.data.map(repo => ({
                name: repo.name,
                stars: repo.stargazers_count,
                language: repo.language
            }))
        };

        try {
            if (redisClient.isReady) {
                // Cache for 1 hour
                await redisClient.setEx(`github:${username}`, 3600, JSON.stringify(data));
            }
        } catch (err) {
            console.error('Redis cache set error:', err);
        }

        // RESUME CLAIM: Non-blocking MongoDB logging
        SearchLog.create({ username, success: true }).catch(console.error);

        res.json(data);

    } catch (error) {
        SearchLog.create({ username, success: false }).catch(console.error);
        res.status(500).json({ error: 'User not found or API limit reached' });
    }
};

module.exports = { getGithubMetrics };