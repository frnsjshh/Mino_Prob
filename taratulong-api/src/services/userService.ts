import { UserRepository } from "../repositories/userRepository";
import { toUserProfileDto, BusinessError } from "./authService";
import { UserProfileDto, UpdateProfileRequest } from "../types/dto";

export class UserService {
  private userRepo = new UserRepository();

  getProfile(userId: string): UserProfileDto {
    const user = this.userRepo.findById(userId);
    if (!user) {
      throw new BusinessError("User not found.");
    }
    return toUserProfileDto(user);
  }

  updateProfile(userId: string, req: UpdateProfileRequest): UserProfileDto {
    const user = this.userRepo.findById(userId);
    if (!user) {
      throw new BusinessError("User not found.");
    }

    // Update base user fields (social links)
    this.userRepo.updateProfile(userId, {
      facebook: req.facebook,
      instagram: req.instagram,
      linkedin: req.linkedin,
    });

    // Update role-specific fields
    if (user.role === "volunteer" || user.role === "admin") {
      if (req.firstName !== undefined && req.lastName !== undefined) {
        if (user.role === "volunteer") {
          this.userRepo.updateVolunteerDetails(userId, req.firstName, req.lastName);
        }
        // Note: admin profile updates could be added if needed
      }
    } else if (user.role === "organization") {
      if (req.orgName !== undefined) {
        this.userRepo.updateOrgDetails(
          userId,
          req.orgName,
          req.location || "",
          req.description || ""
        );
      }
    }

    return this.getProfile(userId);
  }

  updateProfilePic(userId: string, picUrl: string): UserProfileDto {
    this.userRepo.updateProfile(userId, { profile_pic: picUrl });
    return this.getProfile(userId);
  }

  // ── Admin operations ──

  getAllOrganizations(): UserProfileDto[] {
    const orgs = this.userRepo.findAllOrganizations();
    return orgs.map(toUserProfileDto);
  }

  updateOrgStatus(orgId: string, status: "APPROVED" | "REJECTED"): UserProfileDto {
    const user = this.userRepo.findById(orgId);
    if (!user || user.role !== "organization") {
      throw new BusinessError("Organization not found.");
    }
    this.userRepo.updateOrgStatus(orgId, status);
    return this.getProfile(orgId);
  }

  deactivateUser(adminId: string, targetEmail: string): void {
    const target = this.userRepo.findByEmail(targetEmail.trim().toLowerCase());
    if (!target) {
      throw new BusinessError(`No user found with email: ${targetEmail}`);
    }
    if (target.role === "admin") {
      throw new BusinessError("Cannot deactivate an admin account.");
    }
    this.userRepo.deactivateUser(target.id);
  }
}
