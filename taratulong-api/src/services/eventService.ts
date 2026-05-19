import { v4 as uuidv4 } from "uuid";
import { EventRepository } from "../repositories/eventRepository";
import { UserRepository } from "../repositories/userRepository";
import { RegistrationRepository } from "../repositories/registrationRepository";
import { EventDto, CreateEventRequest } from "../types/dto";
import { BusinessError } from "./authService";

export class EventService {
  private eventRepo = new EventRepository();
  private userRepo = new UserRepository();
  private regRepo = new RegistrationRepository();

  getAllEvents(): EventDto[] {
    const events = this.eventRepo.findAll();
    return events.map((e) => this.toEventDto(e));
  }

  getEventById(id: string): EventDto {
    const event = this.eventRepo.findById(id);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    return this.toEventDto(event);
  }

  getEventsByOrganizer(organizerId: string): EventDto[] {
    const events = this.eventRepo.findByOrganizerId(organizerId);
    return events.map((e) => this.toEventDto(e));
  }

  createEvent(organizerId: string, req: CreateEventRequest): EventDto {
    // Verify org is approved
    const org = this.userRepo.findById(organizerId);
    if (!org || org.role !== "organization") {
      throw new BusinessError("Only organizations can create events.");
    }
    if (org.role === "organization" && org.status !== "APPROVED") {
      throw new BusinessError("Your organization must be approved before creating events.");
    }

    if (!req.title.trim()) {
      throw new BusinessError("Event title is required.");
    }
    if (req.slotsAvailable < 1) {
      throw new BusinessError("Slots must be at least 1.");
    }

    const startDate = new Date(req.startDate);
    const endDate = new Date(req.endDate);
    if (startDate >= endDate) {
      throw new BusinessError("Start date must be before end date.");
    }

    const event = {
      id: uuidv4(),
      organizer_id: organizerId,
      title: req.title.trim(),
      description: req.description.trim(),
      location: req.location.trim(),
      start_date: req.startDate,
      end_date: req.endDate,
      slots_available: req.slotsAvailable,
      image_url: req.imageUrl || "",
    };

    this.eventRepo.create(event);
    return this.toEventDto(event);
  }

  private toEventDto(event: any): EventDto {
    const org = this.userRepo.findById(event.organizer_id);
    let organizerName = "Unknown";
    if (org && org.role === "organization") {
      organizerName = org.org_name;
    }

    return {
      id: event.id,
      organizerId: event.organizer_id,
      organizerName,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      slotsAvailable: event.slots_available,
      imageUrl: event.image_url,
    };
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
