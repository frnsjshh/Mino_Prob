// ── DTOs: Data Transfer Objects ──
// These define what the API sends/receives (never expose password hashes)

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface VolunteerSignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface OrgSignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  orgName: string;
  location: string;
  description: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfileDto;
}

// User profile (public-safe)
export interface UserProfileDto {
  id: string;
  email: string;
  role: "admin" | "volunteer" | "organization";
  joinDate: string;
  profilePic: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  active: boolean;
  // Volunteer / Admin
  firstName?: string;
  lastName?: string;
  // Organization
  orgName?: string;
  location?: string;
  description?: string;
  orgStatus?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  orgName?: string;
  location?: string;
  description?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

// Events
export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  slotsAvailable: number;
  imageUrl?: string;
}

export interface EventDto {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  slotsAvailable: number;
  imageUrl: string;
}

// Registrations
export interface CreateRegistrationRequest {
  eventId: string;
}

export interface UpdateRegistrationRequest {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  participated?: boolean;
  rating?: number;
}

export interface RegistrationDto {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerAttendanceRate: number;
  volunteerAvgRating: number;
  eventId: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  organizerName: string;
  status: string;
  participated: boolean;
  rating: number;
}

// API Error
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}
