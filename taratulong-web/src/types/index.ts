export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'volunteer' | 'organization';
  joinDate: string;
  profilePic: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  active: boolean;
  firstName?: string;
  lastName?: string;
  orgName?: string;
  location?: string;
  description?: string;
  orgStatus?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
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
