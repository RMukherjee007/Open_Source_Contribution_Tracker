import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Icons from '../components/Icons';

const SPARKLINE_PATHS = [
  'M0,28 C20,26 35,12 55,18 C75,24 90,6 115,10 C135,14 148,22 160,16',
  'M0,24 C25,30 45,16 70,20 C95,24 112,8 135,12 C148,14 155,8 160,6',
  'M0,26 C22,14 44,24 68,12 C92,4 115,18 138,10 C150,6 156,12 160,8',
  'M0,28 C30,24 50,18 75,22 C100,26 120,10 142,14 C152,16 157,10 160,12'
];

function UserResult({ saveRecentSearch, toggleFavorite, favorites }) {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError('');
      try {
        const envApiUrl = import.meta.env.VITE_API_URL;
        const baseUrl = envApiUrl
          ? envApiUrl.replace(/\/$/, '')
          : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5001'
          ? 'http://localhost:5001'
          : '';
        const apiUrl = `${baseUrl}/api/github/${username}`;

        const response = await axios.get(apiUrl);
        if (cancelled) return;
        setData(response.data);
        saveRecentSearch({
          login: response.data.profile.login || username,
          name: response.data.profile.name || username,
          avatar: response.data.profile.avatar
        });
      } catch {
        if (!cancelled) {
          setError('User not found or API limit reached.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, [username, saveRecentSearch]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getCardColorClass = (index) => {
    const classes = ['card-black', 'card-green', 'card-grey', 'card-white'];
    return classes[index % classes.length];
  };

  const isFavorite = data && favorites.some(f => f.login === (data.profile.login || username));

  // Compute unique languages
  const topLanguages = data ? [...new Set(data.recentRepos.map(r => r.language).filter(Boolean))].slice(0, 5) : [];

  const weeklyActivity = data?.analytics?.weeklyActivity || [];
  const gauge = data?.analytics?.gauge || { percentage: 76, originalPct: 70, starredPct: 50 };
  const activityGrowth = data?.analytics?.activityGrowth || [];

  // Semi-circle gauge geometry (radius 82, arc length = PI * 82 = 257.6)
  const arcRadius = 82;
  const halfCircumference = Math.PI * arcRadius;
  const primaryArcOffset = halfCircumference * (1 - (gauge.percentage || 72) / 100);
  const secondaryPct = Math.min(96, Math.max(gauge.percentage + 14, gauge.originalPct || 82));
  const secondaryArcOffset = halfCircumference * (1 - secondaryPct / 100);

  return (
    <div className="container fade-in" style={{ paddingTop: '2rem' }}>
      <div className="user-nav-header">
        <Link to="/" className="back-link">
          <Icons.ArrowLeft /> Back to Home
        </Link>
      </div>

      {loading && <div className="loading-state" style={{ textAlign: 'center', marginTop: '4rem' }}><span className="spinner"></span></div>}

      {error && !loading && <div className="error fade-in">{error}</div>}

      {data && !loading && (
        <div className="fade-in">
          <div className="profile-container">
            <div className="profile-avatar-card">
              <img src={data.profile.avatar} alt="Profile" className="avatar" />
              <h2>
                <a href={`https://github.com/${data.profile.login || username}`} target="_blank" rel="noopener noreferrer">
                  {data.profile.name || username}
                </a>
              </h2>
              <p style={{ opacity: 0.8, fontSize: '1.2rem', marginBottom: '1.5rem' }}>@{data.profile.login || username}</p>

              <div className="profile-actions">
                <button
                  className={`bookmark-btn ${isFavorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite({
                    login: data.profile.login || username,
                    name: data.profile.name || username,
                    avatar: data.profile.avatar
                  })}
                >
                  {isFavorite ? <Icons.StarFilled /> : <Icons.Star />}
                  {isFavorite ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button className="share-btn" onClick={handleShare}>
                  <Icons.Share />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            <div className="profile-stats-card">
              <h3>GitHub Stats</h3>
              <div className="stats-grid">
                {[
                  { label: 'Followers', value: data.profile.followers, color: '#34d399', badge: 'Community' },
                  { label: 'Following', value: data.profile.following || 0, color: '#60a5fa', badge: 'Network' },
                  { label: 'Public Repos', value: data.profile.repos, color: '#fbbf24', badge: 'Projects' },
                  { label: 'Public Gists', value: data.profile.gists || 0, color: '#c084fc', badge: 'Snippets' }
                ].map((stat, idx) => (
                  <div key={stat.label} className="stat-box stat-box-with-wave">
                    <div className="stat-box-top">
                      <span className="stat-label">{stat.label}</span>
                      <span className="stat-mini-pill" style={{ color: stat.color }}>{stat.badge}</span>
                    </div>
                    <span className="stat-value">{stat.value}</span>
                    <svg className="stat-wave-svg" viewBox="0 0 160 34" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`wave-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stat.color} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={stat.color} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${SPARKLINE_PATHS[idx]} L160,34 L0,34 Z`}
                        fill={`url(#wave-grad-${idx})`}
                      />
                      <path
                        d={SPARKLINE_PATHS[idx]}
                        fill="none"
                        stroke={stat.color}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ANALYTICS GRAPHS SECTION */}
          <div className="analytics-dashboard-grid">
            {/* Graph 1: Weekly Activity Pill Bars (Image 1 "Project Analytics" style) */}
            <div className="analytics-card card-white">
              <div className="analytics-card-header">
                <h3>Contribution Analytics</h3>
                <span className="analytics-subtle-tag">Weekly Rhythm</span>
              </div>

              <div className="pill-bars-stage">
                {weeklyActivity.map((item, idx) => {
                  const showBadge = hoveredDay === idx || (hoveredDay === null && item.isPeak);
                  const barToneClass = item.isPeak
                    ? 'pill-bar-highlight'
                    : item.isSolid
                    ? idx % 2 === 0
                      ? 'pill-bar-dark'
                      : 'pill-bar-mid'
                    : 'pill-bar-hatched';

                  return (
                    <div
                      key={idx}
                      className="pill-bar-column"
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div className="pill-bar-track">
                        <div
                          className={`pill-bar-fill ${barToneClass}`}
                          style={{ height: `${item.heightPct}%` }}
                        >
                          {showBadge && (
                            <div className="pill-floating-badge">
                              <span>{item.sharePct}%</span>
                              <span className="pill-badge-dot" />
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="pill-day-label" title={item.dayName}>{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Graph 2: Semi-Circle Arch Gauge (Image 1 "Project Progress" style) */}
            <div className="analytics-card card-white">
              <div className="analytics-card-header">
                <h3>Footprint Progress</h3>
                <span className="analytics-subtle-tag">{gauge.totalStars || 0} Total ★</span>
              </div>

              <div className="gauge-stage">
                <svg className="semi-gauge-svg" viewBox="0 0 220 130">
                  <defs>
                    <pattern id="gaugeHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#9ca3af" strokeWidth="3.5" strokeOpacity="0.45" />
                    </pattern>
                  </defs>

                  {/* Hatched background track */}
                  <path
                    d="M 28 108 A 82 82 0 0 1 192 108"
                    fill="none"
                    stroke="url(#gaugeHatch)"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />

                  {/* Secondary dark-green arc (Original Repos share) */}
                  <path
                    d="M 28 108 A 82 82 0 0 1 192 108"
                    fill="none"
                    stroke="var(--chart-bar-dark)"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeDasharray={halfCircumference}
                    strokeDashoffset={secondaryArcOffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />

                  {/* Primary bright-green arc (Impact Percentage) */}
                  <path
                    d="M 28 108 A 82 82 0 0 1 192 108"
                    fill="none"
                    stroke="var(--chart-bar-light)"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeDasharray={halfCircumference}
                    strokeDashoffset={primaryArcOffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>

                <div className="gauge-center-Readout">
                  <span className="gauge-big-pct">{gauge.percentage}%</span>
                  <span className="gauge-sub-caption">Impact Score</span>
                </div>
              </div>

              <div className="gauge-legend">
                <div className="gauge-legend-item">
                  <span className="legend-dot" style={{ background: 'var(--chart-bar-light)' }} />
                  <span>Impact ({gauge.percentage}%)</span>
                </div>
                <div className="gauge-legend-item">
                  <span className="legend-dot" style={{ background: 'var(--chart-bar-dark)' }} />
                  <span>Original ({gauge.originalPct}%)</span>
                </div>
                <div className="gauge-legend-item">
                  <span className="legend-dot legend-dot-hatched" />
                  <span>Forked ({100 - (gauge.originalPct || 0)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graph 3: Multi-Segment Capsule Activity Growth Chart (Image 2 "Activity Growth" style) */}
          {activityGrowth.length > 0 && (
            <div className="analytics-card card-white activity-growth-card">
              <div className="analytics-card-header">
                <h3>Repository Activity Growth</h3>
                <span className="analytics-subtle-tag">Recent {activityGrowth.length} Repositories</span>
              </div>

              <div className="growth-chart-body">
                <div className="growth-y-axis">
                  <span>80%</span>
                  <span>60%</span>
                  <span>40%</span>
                  <span>20%</span>
                </div>

                <div className="growth-columns-wrap">
                  <div className="growth-grid-lines">
                    <div className="growth-grid-line" />
                    <div className="growth-grid-line" />
                    <div className="growth-grid-line" />
                    <div className="growth-grid-line" />
                  </div>

                  <div className="growth-bars-row">
                    {activityGrowth.map((item, idx) => (
                      <div
                        key={`${item.fullName}-${idx}`}
                        className="growth-col-item"
                        title={`${item.fullName} — ★ ${item.stars} | Forks: ${item.forks} | ${item.language}`}
                      >
                        <div className="growth-segments-stack">
                          <span
                            className="growth-seg seg-amber"
                            style={{ height: `${item.forkSeg * 1.4}px` }}
                          />
                          <span
                            className="growth-seg seg-teal"
                            style={{ height: `${item.starSeg * 1.5}px` }}
                          />
                          <span
                            className="growth-seg seg-coral"
                            style={{ height: `${item.codeSeg * 1.5}px` }}
                          />
                        </div>
                        <span className="growth-x-label">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="gauge-legend" style={{ justifyContent: 'flex-start', marginTop: '1.25rem' }}>
                <div className="gauge-legend-item">
                  <span className="legend-dot" style={{ background: '#d96b6b' }} />
                  <span>Code Volume</span>
                </div>
                <div className="gauge-legend-item">
                  <span className="legend-dot" style={{ background: '#3d8b8d' }} />
                  <span>Star Reach</span>
                </div>
                <div className="gauge-legend-item">
                  <span className="legend-dot" style={{ background: '#d49b35' }} />
                  <span>Fork Activity</span>
                </div>
              </div>
            </div>
          )}

          <div className="section-header-flex">
            <h2 className="section-title">Recent Work</h2>
            {topLanguages.length > 0 && (
              <div className="language-badges">
                {topLanguages.map(lang => (
                  <span key={lang} className="lang-badge">{lang}</span>
                ))}
              </div>
            )}
          </div>

          <div className="repo-grid">
            {data.recentRepos.map((repo, index) => (
              <div
                key={index}
                className={`repo-card fade-in ${getCardColorClass(index)}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <a href={`https://github.com/${data.profile.login || username}/${repo.name}`} target="_blank" rel="noopener noreferrer" className="repo-name">
                    {repo.name}
                  </a>
                  <p className="repo-desc">
                    {repo.description || "A public repository on GitHub."}
                  </p>
                </div>
                <div className="repo-stats">
                  <span className="repo-stat-item" title="Stars">
                    <Icons.Star /> {repo.stars}
                  </span>
                  <span className="repo-stat-item" title="Language">
                    <Icons.Code /> {repo.language || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserResult;
