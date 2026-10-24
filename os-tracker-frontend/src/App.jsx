import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import Icons from './components/Icons';
import GlobalSearchModal from './components/GlobalSearchModal';
import SidebarMenu from './components/SidebarMenu';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import UserResult from './pages/UserResult';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'object' && item.login) : [];
      }
    } catch {
      // Ignore malformed localStorage
    }
    return [];
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore malformed localStorage
    }
    return [];
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const saveRecentSearch = useCallback((userObj) => {
    setRecentSearches(prev => {
      let updated = [userObj, ...prev.filter(s => s.login.toLowerCase() !== userObj.login.toLowerCase())];
      if (updated.length > 10) updated = updated.slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = (userObj) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.login === userObj.login);
      const updated = exists
        ? prev.filter(f => f.login !== userObj.login)
        : [userObj, ...prev];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.setItem('recentSearches', JSON.stringify([]));
  };

  return (
    <>
      <ScrollToTop />
      {/* Global Navbar */}
      <nav className="global-navbar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <Icons.Code /> OS Tracker
          </Link>
          <div className="nav-actions">
            <button className="hamburger-btn" onClick={() => setIsSearchModalOpen(true)} title="Global Search">
              <Icons.Search />
            </button>
            <a href="https://github.com/RMukherjee007/FSD-End-Term-Project" target="_blank" rel="noopener noreferrer" className="hamburger-btn" title="Source Code">
              <Icons.Github />
            </a>
            <button className="hamburger-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </button>
            <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
              <Icons.Menu />
            </button>
          </div>
        </div>
      </nav>

      <GlobalSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      {/* Sidebar Overlay Menu */}
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        recentSearches={recentSearches}
        favorites={favorites}
        clearHistory={clearHistory}
      />

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home recentSearches={recentSearches} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route
            path="/user/:username"
            element={
              <UserResult
                saveRecentSearch={saveRecentSearch}
                toggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            }
          />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
