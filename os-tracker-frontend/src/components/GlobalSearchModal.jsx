import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from './Icons';

function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const target = query.trim();
      setQuery('');
      onClose();
      navigate(`/user/${target}`);
    }
  };

  return (
    <div className="drawer-overlay fade-in" style={{ zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }} onClick={handleClose}>
      <div className="search-modal-box fade-in" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="search-modal-form">
          <Icons.Search />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search any GitHub username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="button" className="close-search-btn" onClick={handleClose}>ESC</button>
        </form>
      </div>
    </div>
  );
}

export default GlobalSearchModal;
