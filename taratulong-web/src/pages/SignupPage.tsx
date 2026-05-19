import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api';

export function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'Volunteer' | 'Organization'>('Volunteer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (role === 'Volunteer') {
        const res = await authApi.registerVolunteer({
          email, password, confirmPassword, firstName, lastName,
        });
        data = res.data;
      } else {
        const res = await authApi.registerOrganization({
          email, password, confirmPassword, orgName, location, description,
        });
        data = res.data;
      }
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
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

      <div className="auth-form-side" style={{ overflowY: 'auto' }}>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Start your volunteer journey today</p>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">I am a...</label>
            <select
              id="signup-role"
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Volunteer' | 'Organization')}
            >
              <option value="Volunteer">Volunteer</option>
              <option value="Organization">Organization</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input id="signup-email" className="input" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input id="signup-password" className="input" type="password" placeholder="Create a password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
            <input id="signup-confirm" className="input" type="password" placeholder="Re-enter your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          {role === 'Volunteer' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-fname">First Name</label>
                <input id="signup-fname" className="input" placeholder="Juan"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-lname">Last Name</label>
                <input id="signup-lname" className="input" placeholder="Dela Cruz"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </>
          )}

          {role === 'Organization' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-orgname">Organization Name</label>
                <input id="signup-orgname" className="input" placeholder="e.g. Bayanihan Foundation"
                  value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-location">Location</label>
                <input id="signup-location" className="input" placeholder="e.g. Quezon City"
                  value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-desc">Description</label>
                <textarea id="signup-desc" className="textarea" placeholder="Tell us about your organization..."
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-cta" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="auth-switch">
            <span>Already have an account?</span>
            <Link to="/login" className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
