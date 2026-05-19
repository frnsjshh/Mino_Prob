import { getDb } from "../database/db";
import { RegistrationRow } from "../types/entities";

export class RegistrationRepository {
  findById(id: string): RegistrationRow | undefined {
    const db = getDb();
    return db
      .prepare("SELECT * FROM registrations WHERE id = ?")
      .get(id) as RegistrationRow | undefined;
  }

  findByVolunteerId(volunteerId: string): RegistrationRow[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM registrations WHERE volunteer_id = ?")
      .all(volunteerId) as RegistrationRow[];
  }

  findByEventId(eventId: string): RegistrationRow[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM registrations WHERE event_id = ?")
      .all(eventId) as RegistrationRow[];
  }

  findByVolunteerAndEvent(
    volunteerId: string,
    eventId: string
  ): RegistrationRow | undefined {
    const db = getDb();
    return db
      .prepare(
        "SELECT * FROM registrations WHERE volunteer_id = ? AND event_id = ?"
      )
      .get(volunteerId, eventId) as RegistrationRow | undefined;
  }

  create(reg: RegistrationRow): void {
    const db = getDb();
    db.prepare(
      `INSERT INTO registrations (id, volunteer_id, event_id, status, participated, rating)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(reg.id, reg.volunteer_id, reg.event_id, reg.status, reg.participated, reg.rating);
  }

  updateStatus(id: string, status: string): void {
    const db = getDb();
    db.prepare("UPDATE registrations SET status = ? WHERE id = ?").run(
      status,
      id
    );
  }

  updateAttendance(id: string, participated: boolean): void {
    const db = getDb();
    db.prepare("UPDATE registrations SET participated = ? WHERE id = ?").run(
      participated ? 1 : 0,
      id
    );
  }

  updateRating(id: string, rating: number): void {
    const db = getDb();
    db.prepare("UPDATE registrations SET rating = ? WHERE id = ?").run(
      rating,
      id
    );
  }

  /** Get stats for a volunteer: attendance rate and average rating */
  getVolunteerStats(volunteerId: string): {
    attendanceRate: number;
    avgRating: number;
  } {
    const db = getDb();
    const approved = db
      .prepare(
        "SELECT * FROM registrations WHERE volunteer_id = ? AND status = 'APPROVED'"
      )
      .all(volunteerId) as RegistrationRow[];

    if (approved.length === 0) {
      return { attendanceRate: 0, avgRating: 0 };
    }

    const present = approved.filter((r) => r.participated === 1).length;
    const attendanceRate = (present / approved.length) * 100;

    const rated = approved.filter((r) => r.rating > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length
        : 0;

    return { attendanceRate, avgRating };
  }
}
