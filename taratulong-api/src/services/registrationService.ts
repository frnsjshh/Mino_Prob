import { v4 as uuidv4 } from "uuid";
import { RegistrationRepository } from "../repositories/registrationRepository";
import { EventRepository } from "../repositories/eventRepository";
import { UserRepository } from "../repositories/userRepository";
import { RegistrationDto, UpdateRegistrationRequest } from "../types/dto";
import { RegistrationRow } from "../types/entities";
import { BusinessError } from "./authService";
import { NotFoundError } from "./eventService";

export class RegistrationService {
  private regRepo = new RegistrationRepository();
  private eventRepo = new EventRepository();
  private userRepo = new UserRepository();

  applyForEvent(volunteerId: string, eventId: string): RegistrationDto {
    // Verify volunteer exists
    const volunteer = this.userRepo.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      throw new BusinessError("Only volunteers can apply for events.");
    }

    // Verify event exists
    const event = this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }

    // Check if already applied
    const existing = this.regRepo.findByVolunteerAndEvent(volunteerId, eventId);
    if (existing) {
      throw new BusinessError("You have already applied for this event.");
    }

    // Check slots
    if (event.slots_available <= 0) {
      throw new BusinessError("Event is full — no slots available.");
    }

    const reg: RegistrationRow = {
      id: uuidv4(),
      volunteer_id: volunteerId,
      event_id: eventId,
      status: "PENDING",
      participated: 0,
      rating: 0,
    };

    this.regRepo.create(reg);
    this.eventRepo.decrementSlots(eventId);

    return this.toRegistrationDto(reg);
  }

  getVolunteerHistory(volunteerId: string): RegistrationDto[] {
    const regs = this.regRepo.findByVolunteerId(volunteerId);
    return regs.map((r) => this.toRegistrationDto(r));
  }

  getEventApplicants(eventId: string, organizerId: string): RegistrationDto[] {
    // Verify the org owns this event
    const event = this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    if (event.organizer_id !== organizerId) {
      throw new BusinessError("You can only view applicants for your own events.");
    }

    const regs = this.regRepo.findByEventId(eventId);
    return regs.map((r) => this.toRegistrationDto(r));
  }

  updateRegistration(
    registrationId: string,
    organizerId: string,
    updates: UpdateRegistrationRequest
  ): RegistrationDto {
    const reg = this.regRepo.findById(registrationId);
    if (!reg) {
      throw new NotFoundError("Registration not found.");
    }

    // Verify the org owns the event
    const event = this.eventRepo.findById(reg.event_id);
    if (!event || event.organizer_id !== organizerId) {
      throw new BusinessError("You can only manage applicants for your own events.");
    }

    if (updates.status !== undefined) {
      // If changing from non-APPROVED to REJECTED or vice versa, handle slot logic
      const oldStatus = reg.status;
      this.regRepo.updateStatus(registrationId, updates.status);

      // If rejecting a previously pending/approved registration, restore slot
      if (updates.status === "REJECTED" && oldStatus !== "REJECTED") {
        this.eventRepo.incrementSlots(reg.event_id);
      }
      // If approving a previously rejected registration, decrement slot
      if (updates.status !== "REJECTED" && oldStatus === "REJECTED") {
        this.eventRepo.decrementSlots(reg.event_id);
      }

      // Reset attendance/rating if not approved
      if (updates.status !== "APPROVED") {
        this.regRepo.updateAttendance(registrationId, false);
        this.regRepo.updateRating(registrationId, 0);
      }
    }

    if (updates.participated !== undefined) {
      this.regRepo.updateAttendance(registrationId, updates.participated);
    }

    if (updates.rating !== undefined) {
      if (updates.rating < 0 || updates.rating > 5) {
        throw new BusinessError("Rating must be between 0 and 5.");
      }
      this.regRepo.updateRating(registrationId, updates.rating);
    }

    const updated = this.regRepo.findById(registrationId)!;
    return this.toRegistrationDto(updated);
  }

  private toRegistrationDto(reg: RegistrationRow): RegistrationDto {
    const volunteer = this.userRepo.findById(reg.volunteer_id);
    const event = this.eventRepo.findById(reg.event_id);

    let volunteerName = "Unknown";
    let volunteerEmail = "";
    if (volunteer && volunteer.role === "volunteer") {
      volunteerName = `${volunteer.first_name} ${volunteer.last_name}`;
      volunteerEmail = volunteer.email;
    }

    const stats = this.regRepo.getVolunteerStats(reg.volunteer_id);

    let eventTitle = "Unknown";
    let eventStartDate = "";
    let eventEndDate = "";
    let organizerName = "Unknown";
    if (event) {
      eventTitle = event.title;
      eventStartDate = event.start_date;
      eventEndDate = event.end_date;
      const org = this.userRepo.findById(event.organizer_id);
      if (org && org.role === "organization") {
        organizerName = org.org_name;
      }
    }

    return {
      id: reg.id,
      volunteerId: reg.volunteer_id,
      volunteerName,
      volunteerEmail,
      volunteerAttendanceRate: stats.attendanceRate,
      volunteerAvgRating: stats.avgRating,
      eventId: reg.event_id,
      eventTitle,
      eventStartDate,
      eventEndDate,
      organizerName,
      status: reg.status,
      participated: !!reg.participated,
      rating: reg.rating,
    };
  }
}
