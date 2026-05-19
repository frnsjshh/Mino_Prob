import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { eventApi, registrationApi, fileApi } from '../api';
import { useToast } from '../components/ui/Toast';
import type { EventDto, RegistrationDto } from '../types';

export function VolunteerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'dashboard' | 'applications'>('dashboard');
  const [events, setEvents] = useState<EventDto[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evRes, regRes] = await Promise.all([
        eventApi.getAll(),
        registrationApi.getMyHistory(),
      ]);
      setEvents(evRes.data);
      setRegistrations(regRes.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const myEventIds = new Set(registrations.map((r) => r.eventId));
  const approvedEventIds = new Set(
    registrations.filter((r) => r.status === 'APPROVED').map((r) => r.eventId)
  );

  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => approvedEventIds.has(e.id) && new Date(e.endDate) >= now
  );
  const discoverEvents = events.filter(
    (e) => !myEventIds.has(e.id) && e.slotsAvailable > 0 && new Date(e.startDate) >= now
  );

  const handleApply = async (eventId: string) => {
    try {
      await registrationApi.apply(eventId);
      showToast('Applied successfully!');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to apply.', 'error');
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
        <h1>Welcome, {user?.firstName}! 👋</h1>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>
          My Applications
        </button>
      </div>

      {tab === 'dashboard' && (
        <>
          {/* Upcoming Accepted Events */}
          <h2 className="section-title">Upcoming Accepted Events</h2>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: 'var(--ink-light)', fontStyle: 'italic', marginBottom: 'var(--space-xl)' }}>
              No upcoming events at the moment.
            </p>
          ) : (
            <div className="event-grid" style={{ marginBottom: 'var(--space-xl)' }}>
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} showApply={false} />
              ))}
            </div>
          )}

          {/* Discover Events */}
          <h2 className="section-title">Discover Events</h2>
          {discoverEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No new events to discover right now.</p>
            </div>
          ) : (
            <div className="event-grid">
              {discoverEvents.map((event) => (
                <EventCard key={event.id} event={event} showApply onApply={() => handleApply(event.id)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'applications' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Organization</th>
                <th>Date</th>
                <th>Status</th>
                <th>Attended</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--ink-light)' }}>
                    No applications yet.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const isPast = new Date(reg.eventEndDate) < now;
                  return (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: 600 }}>{reg.eventTitle}</td>
                      <td>{reg.organizerName}</td>
                      <td>{reg.eventStartDate}</td>
                      <td>
                        <span className={`badge badge-${reg.status.toLowerCase()}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        {isPast && reg.status === 'APPROVED' ? (
                          <span style={{ color: reg.participated ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                            {reg.participated ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--ink-muted)' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Event Card Sub-component ──
function EventCard({
  event,
  showApply,
  onApply,
}: {
  event: EventDto;
  showApply: boolean;
  onApply?: () => void;
}) {
  const imgSrc = event.imageUrl ? fileApi.getUrl(event.imageUrl) : '';

  return (
    <div className="card">
      {imgSrc ? (
        <img className="event-card-img" src={imgSrc} alt={event.title} />
      ) : (
        <div className="event-card-img">📷 Event Image</div>
      )}
      <div className="event-card-content">
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-desc">{event.description}</div>
        <div className="event-card-org">🏢 {event.organizerName}</div>
        <div className="event-card-meta">
          🎟 {event.slotsAvailable} slots  ·  📅 {event.startDate}
        </div>
      </div>
      <div className="event-card-actions">
        {showApply && (
          <button className="btn btn-cta btn-sm" onClick={onApply}>
            Volunteer Now
          </button>
        )}
      </div>
    </div>
  );
}
