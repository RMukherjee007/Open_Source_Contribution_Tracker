import { Link } from 'react-router-dom';
import Icons from '../components/Icons';

function AboutPage() {
  return (
    <div className="container fade-in" style={{ paddingTop: '2rem', maxWidth: '800px', paddingBottom: '4rem' }}>
      <Link to="/" className="back-link" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
        <Icons.ArrowLeft /> Back to Home
      </Link>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>About OS Tracker</h1>
      
      <div className="card-white" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', fontSize: '1.1rem', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '2rem' }}>
          OS Tracker is a powerful, minimalist open-source footprint analysis tool designed for developers, recruiters, and open-source enthusiasts. 
          It provides real-time, actionable insights into GitHub profiles, analyzing top programming languages, most recently updated repositories, and core community statistics.
        </p>

        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '2rem' }}>Our Mission</h3>
        <p style={{ marginBottom: '2rem' }}>
          The open-source ecosystem is vast and constantly evolving. Our mission is to democratize developer analytics by creating a fast, accessible, and beautifully designed platform that allows anyone to instantly visualize a developer's impact without jumping through hoops or creating accounts.
        </p>
        
        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '2rem' }}>Core Features</h3>
        <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Real-Time Analytics:</strong> Fetches live data directly from the GitHub API, ensuring your insights are always accurate and up-to-date down to the second.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Language Tracking:</strong> Automatically detects, aggregates, and highlights the programming languages a developer uses most frequently across their recent public work.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Persistent Bookmarking:</strong> Allows you to save favorite developer profiles directly to your browser's local storage for lightning-fast access later.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Adaptive Theming:</strong> A meticulously designed user interface that seamlessly switches between a high-contrast Light mode and a sleek, eye-strain-reducing Dark mode.</li>
        </ul>

        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '2rem' }}>Design Philosophy</h3>
        <p style={{ marginBottom: '2rem' }}>
          We believe that developer tools shouldn't be entirely utilitarian. OS Tracker employs modern web design principles including <strong>glassmorphism</strong>, bold typography, and fluid micro-animations. By shedding unnecessary visual clutter and focusing on a "tech lab" aesthetic, the platform presents complex data in a highly digestible format.
        </p>

        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '2rem' }}>Technology Stack</h3>
        <p style={{ marginBottom: '2rem' }}>
          This application is built from the ground up using a modern JavaScript stack. The highly responsive frontend is powered by <strong>React.js</strong> and bundled with <strong>Vite</strong> for exceptional performance. All styling is achieved through custom Vanilla CSS leveraging CSS Variables for dynamic theming, entirely bypassing heavy CSS frameworks. The backend utilizes <strong>Node.js</strong> and <strong>Express</strong> to securely proxy requests to the GitHub API, mitigating strict browser CORS policies and preventing rate-limiting issues.
        </p>

        <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '2rem' }}>The Project</h3>
        <p style={{ marginBottom: '2rem' }}>
          Developed as a Full Stack Development End Term Project by <strong>Raghav Mukherjee</strong>. OS Tracker serves as a testament to building responsive, user-centric, and beautifully engineered web applications.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
