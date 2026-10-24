const axios = require('axios');
const SearchLog = require('../models/SearchLog');
const redisClient = require('../utils/redisClient');

const logSearch = (username, success) => {
    if (SearchLog.db?.readyState === 1) {
        SearchLog.create({ username, success }).catch(console.error);
    }
};

const getGithubMetrics = async (req, res) => {
    const { username } = req.params;
    const cacheKey = `github:v3:${username.toLowerCase()}`;

    try {
        let cachedData = null;
        try {
            if (redisClient.isReady) {
                cachedData = await redisClient.get(cacheKey);
            }
        } catch (err) {
            console.error('Redis cache get error:', err);
        }

        if (cachedData) {
            logSearch(username, true);
            return res.json(JSON.parse(cachedData));
        }

        const reqHeaders = {
            'User-Agent': 'os-tracker'
        };
        if (process.env.GITHUB_TOKEN) {
            reqHeaders.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch profile, repositories, and public events concurrently
        const [profileRes, reposRes, eventsRes] = await Promise.allSettled([
            axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: reqHeaders }),
            axios.get(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`, { headers: reqHeaders }),
            axios.get(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=60`, { headers: reqHeaders })
        ]);

        if (profileRes.status === 'rejected') {
            throw profileRes.reason;
        }

        const profileData = profileRes.value.data;
        const allRepos = reposRes.status === 'fulfilled' && Array.isArray(reposRes.value.data)
            ? reposRes.value.data
            : [];
        const events = eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)
            ? eventsRes.value.data
            : [];

        // 1. Weekly Activity Pill Bars (Sun - Sat)
        const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        for (const ev of events) {
            if (ev.created_at) {
                const d = new Date(ev.created_at).getUTCDay();
                if (!Number.isNaN(d)) dayCounts[d] += 1;
            }
        }
        // Also weight by recent repository push dates so users with older events still show a rich curve
        for (const repo of allRepos) {
            if (repo.pushed_at) {
                const d = new Date(repo.pushed_at).getUTCDay();
                if (!Number.isNaN(d)) dayCounts[d] += 2;
            }
        }

        const maxDayCount = Math.max(...dayCounts, 1);
        const totalDayPoints = dayCounts.reduce((a, b) => a + b, 0) || 1;
        const peakIndex = dayCounts.indexOf(Math.max(...dayCounts));

        const weeklyActivity = dayCounts.map((count, idx) => {
            // Normalize height between 38% and 96% for visual pill proportions
            const heightPct = count === 0
                ? 42 + ((idx * 11) % 24)
                : Math.round(42 + (count / maxDayCount) * 54);
            const sharePct = Math.max(8, Math.round((count / totalDayPoints) * 100));
            return {
                day: dayLetters[idx],
                dayName: dayNames[idx],
                count,
                heightPct,
                sharePct,
                isPeak: idx === peakIndex && count > 0,
                isSolid: count >= maxDayCount * 0.45 && count > 0
            };
        });

        // 2. Semi-Circle Gauge Metrics (Impact & Originality Progress)
        const totalReposCount = allRepos.length || 1;
        const originalReposCount = allRepos.filter(r => !r.fork).length;
        const starredReposCount = allRepos.filter(r => (r.stargazers_count || 0) > 0).length;
        const totalStars = allRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const totalForks = allRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

        const originalityRatio = Math.round((originalReposCount / totalReposCount) * 100);
        const starEngagementRatio = Math.round((starredReposCount / totalReposCount) * 100);
        const impactPercentage = Math.min(
            98,
            Math.max(
                24,
                Math.round(
                    originalityRatio * 0.45 +
                    starEngagementRatio * 0.3 +
                    Math.min(25, Math.log10(totalStars + profileData.followers + 1) * 6)
                )
            )
        );

        // 3. Multi-Segment Capsule Growth Data (across up to 12 recent repos)
        const growthSlice = allRepos.slice(0, 12).reverse();
        const maxRepoStars = Math.max(...growthSlice.map(r => r.stargazers_count || 0), 1);
        const maxRepoSize = Math.max(...growthSlice.map(r => r.size || 10), 1);
        const maxRepoForks = Math.max(...growthSlice.map(r => r.forks_count || 0), 1);

        const activityGrowth = growthSlice.map((repo, idx) => {
            const codeSeg = Math.round(16 + (Math.log2((repo.size || 10) + 2) / Math.log2(maxRepoSize + 2)) * 24);
            const starSeg = Math.round(14 + (Math.log2((repo.stargazers_count || 0) + 2) / Math.log2(maxRepoStars + 2)) * 22);
            const forkSeg = Math.round(10 + (Math.log2((repo.forks_count || 0) + 2) / Math.log2(maxRepoForks + 2)) * 18);
            return {
                label: repo.name.length > 8 ? `${repo.name.slice(0, 7)}…` : repo.name,
                fullName: repo.name,
                codeSeg,
                starSeg,
                forkSeg,
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                language: repo.language || 'Code',
                index: idx + 1
            };
        });

        const data = {
            profile: {
                login: profileData.login,
                name: profileData.name,
                followers: profileData.followers,
                following: profileData.following,
                repos: profileData.public_repos,
                gists: profileData.public_gists,
                avatar: profileData.avatar_url
            },
            recentRepos: allRepos.slice(0, 6).map(repo => ({
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count || 0,
                language: repo.language
            })),
            analytics: {
                weeklyActivity,
                gauge: {
                    percentage: impactPercentage,
                    originalPct: originalityRatio,
                    starredPct: starEngagementRatio,
                    totalStars,
                    totalForks,
                    originalReposCount,
                    forkedReposCount: allRepos.length - originalReposCount
                },
                activityGrowth
            }
        };

        try {
            if (redisClient.isReady) {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
            }
        } catch (err) {
            console.error('Redis cache set error:', err);
        }

        logSearch(data.profile.login || username, true);
        return res.json(data);
    } catch (error) {
        logSearch(username, false);
        const status = error.response?.status === 404
            ? 404
            : error.response?.status === 403 || error.response?.status === 429
            ? 429
            : 500;
        return res.status(status).json({ error: 'User not found or API limit reached' });
    }
};

module.exports = { getGithubMetrics };
