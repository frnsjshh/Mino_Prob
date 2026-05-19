import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-branding">
        <h1 className="auth-branding-tagline">
          Connecting hearts,<br />building communities.
        </h1>
        <p className="auth-branding-subtext">
          Join thousands of volunteers making a difference across the Philippines.
        </p>
        <ul className="auth-branding-bullets">
          <li>🤝  Find meaningful volunteer events near you</li>
          <li>📋  Track your impact and attendance history</li>
          <li>🏢  Organizations can manage events effortlessly</li>
        </ul>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your volunteer journey</p>

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-switch">
            <span>Don't have an account?</span>
            <Link to="/signup" className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
