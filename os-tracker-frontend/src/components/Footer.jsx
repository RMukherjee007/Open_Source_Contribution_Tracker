import { Link } from 'react-router-dom';
import Icons from './Icons';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div className="footer-logo">
          <Icons.Code /> OS Tracker
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="https://github.com/RMukherjee007" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} OS Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
