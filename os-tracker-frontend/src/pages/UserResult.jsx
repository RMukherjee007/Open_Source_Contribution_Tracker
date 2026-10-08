import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icons from '../components/Icons';

function UserResult({ saveRecentSearch, toggleFavorite, favorites }) {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = async (userToFetch) => {
    setLoading(true);
    setError('');
    try {
      const envApiUrl = import.meta.env.VITE_API_URL;
      const baseUrl = envApiUrl
        ? envApiUrl.replace(/\/$/, '')
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5001'
            : '');
      const apiUrl = `${baseUrl}/api/github/${userToFetch}`;

      const response = await axios.get(apiUrl);
      setData(response.data);
      saveRecentSearch({
        login: response.data.profile.login || userToFetch,
        name: response.data.profile.name || userToFetch,
        avatar: response.data.profile.avatar
      });
    } catch (err) {
      setError('User not found or API limit reached.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData(username);
  }, [username]);

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
                <div className="stat-box">
                  <span className="stat-label">Followers</span>
                  <span className="stat-value">{data.profile.followers}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Following</span>
                  <span className="stat-value">{data.profile.following || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Public Repos</span>
                  <span className="stat-value">{data.profile.repos}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Public Gists</span>
                  <span className="stat-value">{data.profile.gists || 0}</span>
                </div>
              </div>
            </div>
          </div>

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

// Ide sync commit
