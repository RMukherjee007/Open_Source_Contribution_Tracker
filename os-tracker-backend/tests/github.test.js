const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const redisClient = require('../utils/redisClient');
const { getGithubMetrics } = require('../controllers/githubController');

describe('OS Tracker Backend Unit Tests', () => {
  test('redisClient fallback cache stores and retrieves values with TTL', async () => {
    assert.equal(redisClient.isReady, true);
    await redisClient.setEx('test:key:1', 60, JSON.stringify({ hello: 'world' }));
    const raw = await redisClient.get('test:key:1');
    assert.deepEqual(JSON.parse(raw), { hello: 'world' });
  });

  test('getGithubMetrics serves cached profile data when present in cache', async () => {
    const samplePayload = {
      profile: {
        login: 'cacheduser',
        name: 'Cached User',
        followers: 42,
        following: 10,
        repos: 12,
        gists: 3,
        avatar: 'https://example.com/avatar.png'
      },
      recentRepos: [{ name: 'demo-repo', description: 'Demo', stars: 5, language: 'JavaScript' }]
    };

    await redisClient.setEx('github:v3:cacheduser', 60, JSON.stringify(samplePayload));

    let statusSent = 200;
    let jsonSent = null;
    const req = { params: { username: 'cacheduser' } };
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(payload) {
        jsonSent = payload;
        return this;
      }
    };

    await getGithubMetrics(req, res);
    assert.equal(statusSent, 200);
    assert.deepEqual(jsonSent, samplePayload);
  });
});
