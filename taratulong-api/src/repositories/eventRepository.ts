import { getDb } from "../database/db";
import { EventRow } from "../types/entities";

export class EventRepository {
  findAll(): EventRow[] {
    const db = getDb();
    return db
      .prepare("SELECT * FROM events ORDER BY start_date DESC")
      .all() as EventRow[];
  }

  findById(id: string): EventRow | undefined {
    const db = getDb();
    return db
      .prepare("SELECT * FROM events WHERE id = ?")
      .get(id) as EventRow | undefined;
  }

  findByOrganizerId(organizerId: string): EventRow[] {
    const db = getDb();
    return db
      .prepare(
        "SELECT * FROM events WHERE organizer_id = ? ORDER BY start_date DESC"
      )
      .all(organizerId) as EventRow[];
  }

  create(event: EventRow): void {
    const db = getDb();
    db.prepare(
      `INSERT INTO events (id, organizer_id, title, description, location, start_date, end_date, slots_available, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      event.id,
      event.organizer_id,
      event.title,
      event.description,
      event.location,
      event.start_date,
      event.end_date,
      event.slots_available,
      event.image_url
    );
  }

  decrementSlots(eventId: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE events SET slots_available = slots_available - 1 WHERE id = ? AND slots_available > 0`
    ).run(eventId);
  }

  incrementSlots(eventId: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE events SET slots_available = slots_available + 1 WHERE id = ?`
    ).run(eventId);
  }
}
