import { useState, useEffect } from 'react';
import { userApi } from '../api';
import { useToast } from '../components/ui/Toast';
import type { UserProfile } from '../types';

export function AdminDashboard() {
  const { showToast } = useToast();
  const [orgs, setOrgs] = useState<UserProfile[]>([]);
  const [deactEmail, setDeactEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const { data } = await userApi.getOrganizations();
      setOrgs(data);
    } catch (err: any) {
      showToast('Failed to load organizations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrgs(); }, []);

  const handleStatusChange = async (orgId: string, status: string) => {
    try {
      await userApi.updateOrgStatus(orgId, status);
      showToast(`Organization ${status.toLowerCase()} successfully!`);
      fetchOrgs();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const handleDeactivate = async () => {
    if (!deactEmail.trim()) {
      showToast('Please enter an email address.', 'warning');
      return;
    }
    try {
      await userApi.deactivateUser(deactEmail);
      showToast(`User ${deactEmail} has been deactivated.`);
      setDeactEmail('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Deactivation failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin Panel — Organization Verification</h1>
      </div>

      {/* Deactivate User Section */}
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 'var(--space-lg)',
        flexWrap: 'wrap',
      }}>
        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Deactivate a user:</label>
        <input
          className="input"
          style={{ maxWidth: 320, flex: 1 }}
          placeholder="Enter user email to deactivate"
          value={deactEmail}
          onChange={(e) => setDeactEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleDeactivate()}
        />
        <button className="btn btn-danger" onClick={handleDeactivate}>
          Deactivate
        </button>
      </div>

      {/* Organizations Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Org Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-light)' }}>
                  No organizations registered yet.
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id}>
                  <td style={{ fontWeight: 600 }}>{org.orgName}</td>
                  <td>{org.email}</td>
                  <td>{org.location}</td>
                  <td>
                    <span className={`badge badge-${org.orgStatus?.toLowerCase()}`}>
                      {org.orgStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={org.orgStatus === 'APPROVED'}
                        onClick={() => handleStatusChange(org.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={org.orgStatus === 'REJECTED'}
                        onClick={() => handleStatusChange(org.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
