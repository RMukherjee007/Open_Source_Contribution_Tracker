import { useNavigate } from 'react-router-dom';
import Icons from './Icons';

function SidebarMenu({ isOpen, onClose, recentSearches, favorites, clearHistory }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (username) => {
    onClose();
    navigate(`/user/${username}`);
  };

  return (
    <>
      <div className="drawer-overlay fade-in" onClick={onClose}></div>
      <div className="drawer-content slide-in-right">
        <div className="drawer-header">
          <h2>Menu</h2>
          <button className="icon-btn" onClick={onClose}><Icons.X /></button>
        </div>

        <div className="drawer-body">
          {/* Favorites Section */}
          <div className="drawer-section">
            <h3 className="drawer-title">Bookmarks</h3>
            {favorites.length === 0 ? (
              <p className="drawer-empty">No bookmarked users.</p>
            ) : (
              <ul className="drawer-list">
                {favorites.map((user) => (
                  <li key={user.login} className="drawer-item" onClick={() => handleNavigate(user.login)}>
                    <img src={user.avatar} alt={user.login} className="drawer-avatar" />
                    <div className="drawer-user-info">
                      <span className="drawer-name">{user.name}</span>
                      <span className="drawer-login">@{user.login}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Searches Section */}
          <div className="drawer-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="drawer-title">Recent Searches</h3>
              {recentSearches.length > 0 && (
                <button className="clear-btn" onClick={clearHistory} title="Clear History">
                  <Icons.Trash2 />
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="drawer-empty">No recent searches.</p>
            ) : (
              <ul className="drawer-list">
                {recentSearches.map((user, idx) => (
                  <li key={idx} className="drawer-item" onClick={() => handleNavigate(user.login)}>
                    <img src={user.avatar} alt={user.login} className="drawer-avatar" />
                    <div className="drawer-user-info">
                      <span className="drawer-name">{user.name}</span>
                      <span className="drawer-login">@{user.login}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarMenu;
