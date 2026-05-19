import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/dashboard">
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.375rem',
          fontWeight: 700,
          color: 'var(--teal)',
        }}>
          🤝 TaraTulong
        </span>
      </Link>

      <div className="navbar-actions">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/profile')}>
          Profile
        </button>
        <button className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
