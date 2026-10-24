import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../components/Icons';

function Home({ recentSearches }) {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e, searchUsername = username) => {
    if (e) e.preventDefault();
    if (!searchUsername) return;
    navigate(`/user/${searchUsername}`);
  };

  return (
    <div className="container fade-in">
      <h1>Track your open source footprint.</h1>

      <form onSubmit={handleSearch} className="search-section">
        <input
          type="text"
          placeholder="Enter GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">
          <Icons.Search />
        </button>
      </form>

      {recentSearches && recentSearches.length > 0 && (
        <div className="jump-back-in fade-in">
          <p className="jump-back-title">Jump back in:</p>
          <div className="jump-back-pills">
            {recentSearches.slice(0, 5).map((user, idx) => (
              <div key={idx} className="jump-back-pill" onClick={() => handleSearch(null, user.login)}>
                <img src={user.avatar} alt={user.login} />
                <span>{user.name || user.login}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="landing-content fade-in">
        <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '2rem', fontSize: '2.5rem' }}>Trending Developers</h2>
        <div className="feature-cards">
          <div className="feature-card card-black" onClick={() => handleSearch(null, 'torvalds')}>
            <h3>Linus Torvalds</h3>
            <p>Explore the creator of Linux and Git.</p>
            <div className="feature-arrow">→</div>
          </div>
          <div className="feature-card card-green" onClick={() => handleSearch(null, 'gaearon')}>
            <h3>Dan Abramov</h3>
            <p>Co-author of Redux and Create React App.</p>
            <div className="feature-arrow">→</div>
          </div>
          <div className="feature-card card-grey" onClick={() => handleSearch(null, 'yyx990803')}>
            <h3>Evan You</h3>
            <p>Creator of Vue.js and Vite.</p>
            <div className="feature-arrow">→</div>
          </div>
        </div>

        <div className="how-it-works">
          <h2 className="section-title" style={{ marginTop: '5rem', marginBottom: '3rem', fontSize: '2.5rem' }}>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Search</h3>
              <p>Enter any valid GitHub username in the large search bar above.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Analyze</h3>
              <p>We fetch real-time profile statistics including followers, repos, and gists.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Track</h3>
              <p>Instantly view their most recently updated repositories and languages.</p>
            </div>
          </div>
        </div>

        <div className="why-os-tracker fade-in">
          <h2 className="section-title" style={{ marginTop: '5rem', marginBottom: '3rem', fontSize: '2.5rem' }}>Why OS Tracker?</h2>
          <div className="steps-grid">
            <div className="step-card feature-highlight">
              <div className="step-icon"><Icons.Code /></div>
              <h3>Real-Time Data</h3>
              <p>Fetches live statistics directly from the GitHub API so you're always up to date.</p>
            </div>
            <div className="step-card feature-highlight">
              <div className="step-icon"><Icons.Sun /></div>
              <h3>Beautifully Themed</h3>
              <p>Meticulously designed with high-contrast Light mode and a sleek, low-strain Dark mode.</p>
            </div>
            <div className="step-card feature-highlight">
              <div className="step-icon"><Icons.Star /></div>
              <h3>Persistent Bookmarks</h3>
              <p>Save your favorite developers directly to your browser's local storage for quick access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
