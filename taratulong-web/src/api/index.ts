import client from './client';
import type { AuthResponse, UserProfile, EventDto, RegistrationDto } from '../types';

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }),

  registerVolunteer: (data: {
    email: string; password: string; confirmPassword: string;
    firstName: string; lastName: string;
  }) => client.post<AuthResponse>('/auth/register/volunteer', data),

  registerOrganization: (data: {
    email: string; password: string; confirmPassword: string;
    orgName: string; location: string; description: string;
  }) => client.post<AuthResponse>('/auth/register/organization', data),
};

// ── Users ──
export const userApi = {
  getMe: () => client.get<UserProfile>('/users/me'),

  updateMe: (data: Record<string, string>) =>
    client.put<UserProfile>('/users/me', data),

  getOrganizations: () =>
    client.get<UserProfile[]>('/users/organizations'),

  updateOrgStatus: (id: string, status: string) =>
    client.patch<UserProfile>(`/users/${id}/status`, { status }),

  deactivateUser: (email: string) =>
    client.post('/users/deactivate', { email }),

  uploadProfilePic: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<UserProfile>('/files/profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ── Events ──
export const eventApi = {
  getAll: () => client.get<EventDto[]>('/events'),

  getById: (id: string) => client.get<EventDto>(`/events/${id}`),

  getMy: () => client.get<EventDto[]>('/events/my'),

  create: (data: {
    title: string; description: string; location: string;
    startDate: string; endDate: string; slotsAvailable: number; imageUrl?: string;
  }) => client.post<EventDto>('/events', data),
};

// ── Registrations ──
export const registrationApi = {
  apply: (eventId: string) =>
    client.post<RegistrationDto>('/registrations', { eventId }),

  getMyHistory: () =>
    client.get<RegistrationDto[]>('/registrations/my'),

  getEventApplicants: (eventId: string) =>
    client.get<RegistrationDto[]>(`/registrations/event/${eventId}`),

  update: (id: string, data: { status?: string; participated?: boolean; rating?: number }) =>
    client.patch<RegistrationDto>(`/registrations/${id}`, data),
};

// ── Files ──
export const fileApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<{ url: string; filename: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getUrl: (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:3452${path}`;
  },
};
