import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { userApi, fileApi } from '../api';
import { useToast } from '../components/ui/Toast';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [orgName, setOrgName] = useState(user?.orgName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [description, setDescription] = useState(user?.description || '');
  const [facebook, setFacebook] = useState(user?.facebook || '');
  const [instagram, setInstagram] = useState(user?.instagram || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string> = { facebook, instagram, linkedin };
      if (user?.role === 'volunteer' || user?.role === 'admin') {
        payload.firstName = firstName;
        payload.lastName = lastName;
      } else if (user?.role === 'organization') {
        payload.orgName = orgName;
        payload.location = location;
        payload.description = description;
      }
      const { data } = await userApi.updateMe(payload);
      updateUser(data);
      showToast('Profile saved successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await userApi.uploadProfilePic(file);
      updateUser(data);
      showToast('Photo updated!');
    } catch (err: any) {
      showToast('Failed to upload photo.', 'error');
    }
  };

  const picUrl = user?.profilePic ? fileApi.getUrl(user.profilePic) : '';

  return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 48 }}>
      <form className="profile-card" onSubmit={handleSave}>
        <h1 style={{ marginBottom: 'var(--space-lg)' }}>Edit Profile</h1>

        {/* Profile Picture */}
        <div className="profile-pic-section">
          <div className="avatar avatar-lg">
            {picUrl ? (
              <img src={picUrl} alt="Profile" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Change Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Role-specific fields */}
        {(user?.role === 'volunteer' || user?.role === 'admin') && (
          <>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">First Name</label>
              <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Last Name</label>
              <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </>
        )}

        {user?.role === 'organization' && (
          <>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Organization Name</label>
              <input className="input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Location</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Description</label>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </>
        )}

        {/* Social Links */}
        <label className="form-label" style={{ marginTop: 'var(--space-md)' }}>
          Social Media Links (optional)
        </label>
        <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
          <input className="input" placeholder="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
          <input className="input" placeholder="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <input className="input" placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
