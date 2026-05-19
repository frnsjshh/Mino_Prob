import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { UserRepository } from "../repositories/userRepository";
import { generateToken } from "../middleware/auth";
import { AuthResponse, UserProfileDto } from "../types/dto";
import { AppUser } from "../types/entities";

export class AuthService {
  private userRepo = new UserRepository();

  async registerVolunteer(
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    this.validateRegistration(email, password, confirmPassword);

    if (!firstName.trim() || !lastName.trim()) {
      throw new BusinessError("First name and last name are required.");
    }

    const existing = this.userRepo.findByEmail(email.trim().toLowerCase());
    if (existing) {
      throw new BusinessError("Email is already registered.");
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    const joinDate = new Date().toISOString().split("T")[0];

    this.userRepo.createVolunteer(
      id,
      email.trim().toLowerCase(),
      passwordHash,
      joinDate,
      firstName.trim(),
      lastName.trim()
    );

    const user = this.userRepo.findById(id)!;
    const token = generateToken(user);
    return { token, user: toUserProfileDto(user) };
  }

  async registerOrganization(
    email: string,
    password: string,
    confirmPassword: string,
    orgName: string,
    location: string,
    description: string
  ): Promise<AuthResponse> {
    this.validateRegistration(email, password, confirmPassword);

    if (!orgName.trim()) {
      throw new BusinessError("Organization name is required.");
    }

    const existing = this.userRepo.findByEmail(email.trim().toLowerCase());
    if (existing) {
      throw new BusinessError("Email is already registered.");
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    const joinDate = new Date().toISOString().split("T")[0];

    this.userRepo.createOrganization(
      id,
      email.trim().toLowerCase(),
      passwordHash,
      joinDate,
      orgName.trim(),
      location.trim(),
      description.trim()
    );

    const user = this.userRepo.findById(id)!;
    const token = generateToken(user);
    return { token, user: toUserProfileDto(user) };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new BusinessError("Email and password are required.");
    }

    const user = this.userRepo.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new BusinessError("Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new BusinessError("Invalid email or password.");
    }

    if (!user.active) {
      throw new BusinessError("This account has been deactivated. Contact admin.");
    }

    const token = generateToken(user);
    return { token, user: toUserProfileDto(user) };
  }

  private validateRegistration(
    email: string,
    password: string,
    confirmPassword: string
  ): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new BusinessError("Enter a valid email address.");
    }
    if (password.length < 6) {
      throw new BusinessError("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      throw new BusinessError("Passwords do not match.");
    }
  }
}

// ── Utility: Convert entity to DTO ──

export function toUserProfileDto(user: AppUser): UserProfileDto {
  const base: UserProfileDto = {
    id: user.id,
    email: user.email,
    role: user.role,
    joinDate: user.join_date,
    profilePic: user.profile_pic,
    facebook: user.facebook,
    instagram: user.instagram,
    linkedin: user.linkedin,
    active: !!user.active,
  };

  if (user.role === "volunteer") {
    base.firstName = user.first_name;
    base.lastName = user.last_name;
  } else if (user.role === "organization") {
    base.orgName = user.org_name;
    base.location = user.location;
    base.description = user.description;
    base.orgStatus = user.status;
  } else if (user.role === "admin") {
    base.firstName = user.first_name;
    base.lastName = user.last_name;
  }

  return base;
}

// ── Custom error class ──

export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}
