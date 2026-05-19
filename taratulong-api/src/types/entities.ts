// ── User Types ──

export interface UserBase {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "volunteer" | "organization";
  join_date: string;
  profile_pic: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  active: number; // SQLite boolean: 1 = true, 0 = false
}

export interface VolunteerRow {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface OrganizationRow {
  user_id: string;
  name: string;
  location: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface AdminRow {
  user_id: string;
  first_name: string;
  last_name: string;
}

// Joined view types (what queries return)
export interface VolunteerUser extends UserBase {
  role: "volunteer";
  first_name: string;
  last_name: string;
}

export interface OrganizationUser extends UserBase {
  role: "organization";
  org_name: string;
  location: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface AdminUser extends UserBase {
  role: "admin";
  first_name: string;
  last_name: string;
}

export type AppUser = VolunteerUser | OrganizationUser | AdminUser;

// ── Event ──

export interface EventRow {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  slots_available: number;
  image_url: string;
}

// ── Registration ──

export interface RegistrationRow {
  id: string;
  volunteer_id: string;
  event_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  participated: number; // SQLite boolean
  rating: number;
}
