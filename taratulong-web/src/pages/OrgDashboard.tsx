import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { eventApi, registrationApi, fileApi } from '../api';
import { useToast } from '../components/ui/Toast';
import type { EventDto, RegistrationDto } from '../types';

export function OrgDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [view, setView] = useState<'events' | 'applicants'>('events');
  const [events, setEvents] = useState<EventDto[]>([]);
  const [applicants, setApplicants] = useState<RegistrationDto[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await eventApi.getMy();
      setEvents(data);
    } catch (err: any) {
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const showApplicants = async (event: EventDto) => {
    try {
      const { data } = await registrationApi.getEventApplicants(event.id);
      setApplicants(data);
      setSelectedEvent(event);
      setView('applicants');
    } catch (err: any) {
      showToast('Failed to load applicants.', 'error');
    }
  };

  const updateReg = async (regId: string, updates: Record<string, any>) => {
    try {
      const { data } = await registrationApi.update(regId, updates);
      setApplicants((prev) => prev.map((a) => (a.id === regId ? data : a)));
      showToast('Updated successfully!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const isPending = user?.orgStatus === 'PENDING';

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page">
      {view === 'events' && (
        <>
          <div className="page-header">
            <h1>Dashboard: {user?.orgName}</h1>
            {!isPending && (
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                + Create Event
              </button>
            )}
          </div>

          {isPending && (
            <div className="warning-banner">
              ⚠ Your organization is pending admin approval. You cannot create events yet.
            </div>
          )}

          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => (
                <div key={event.id} className="card" style={{ cursor: 'pointer' }} onClick={() => showApplicants(event)}>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="event-card-title">{event.title}</div>
                    <div className="event-card-desc">{event.description}</div>
                    <div className="event-card-meta">
                      Slots: {event.slotsAvailable} | {event.startDate}
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                      Show Applicants
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'applicants' && selectedEvent && (
        <>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="btn btn-ghost" onClick={() => setView('events')}>← Back</button>
              <h2>Applicants for: {selectedEvent.title}</h2>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Avg Rating</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Present?</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-light)' }}>
                      No applicants yet.
                    </td>
                  </tr>
                ) : (
                  applicants.map((reg) => (
                    <tr key={reg.id}>
                      <td>
                        <span style={{ color: 'var(--teal)', fontWeight: 600 }}>
                          {reg.volunteerName}
                        </span>
                      </td>
                      <td>{reg.volunteerAvgRating.toFixed(1)} ★</td>
                      <td>{reg.volunteerAttendanceRate.toFixed(1)}%</td>
                      <td>
                        <select
                          className="select"
                          style={{ width: 'auto', minWidth: 120 }}
                          value={reg.status}
                          onChange={(e) => updateReg(reg.id, { status: e.target.value })}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={reg.participated}
                          disabled={reg.status !== 'APPROVED'}
                          onChange={(e) => updateReg(reg.id, { participated: e.target.checked })}
                          style={{ width: 18, height: 18, cursor: reg.status === 'APPROVED' ? 'pointer' : 'not-allowed' }}
                        />
                      </td>
                      <td>
                        <select
                          className="select"
                          style={{ width: 'auto', minWidth: 70 }}
                          value={reg.rating}
                          disabled={reg.status !== 'APPROVED'}
                          onChange={(e) => updateReg(reg.id, { rating: parseInt(e.target.value) })}
                        >
                          {[0, 1, 2, 3, 4, 5].map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create Event Modal */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchEvents(); }}
        />
      )}
    </div>
  );
}

// ── Create Event Modal ──
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slots, setSlots] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const { data } = await fileApi.upload(imageFile);
        imageUrl = data.url;
      }

      await eventApi.create({
        title,
        description,
        location,
        startDate: startDate.replace('T', ' '),
        endDate: endDate.replace('T', ' '),
        slotsAvailable: parseInt(slots),
        imageUrl,
      });
      showToast('Event created successfully!');
      onCreated();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create event.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Event</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="input" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="input" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Slots Available</label>
              <input className="input" type="number" min="1" value={slots} onChange={(e) => setSlots(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Event Image (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
