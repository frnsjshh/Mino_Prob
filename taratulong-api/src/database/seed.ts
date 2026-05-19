import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../database/db";
import { UserRepository } from "../repositories/userRepository";
import { EventRepository } from "../repositories/eventRepository";

/**
 * Seeds demo data matching the original PyQt6 init_dummy_data().
 * Only runs if the users table is empty (fresh database).
 */
export async function seedDemoData(): Promise<void> {
  const db = getDb();
  const count = db.prepare("SELECT COUNT(*) as cnt FROM users").get() as { cnt: number };

  if (count.cnt > 0) {
    console.log("📋 Database already has data — skipping seed.");
    return;
  }

  console.log("🌱 Seeding demo data...");

  const userRepo = new UserRepository();
  const eventRepo = new EventRepository();
  const today = new Date().toISOString().split("T")[0];

  // All demo accounts use "password"
  const hash = await bcrypt.hash("password", 12);

  // 1. Admin
  const adminId = uuidv4();
  userRepo.createAdmin(adminId, "admin@test.com", hash, today, "System", "Admin");

  // 2. Volunteers
  userRepo.createVolunteer(uuidv4(), "vol1@test.com", hash, today, "Juan", "Dela Cruz");
  userRepo.createVolunteer(uuidv4(), "vol2@test.com", hash, today, "Maria", "Clara");

  // 3. Organization 1 — manually set to APPROVED
  const org1Id = uuidv4();
  userRepo.createOrganization(
    org1Id, "org1@test.com", hash, today,
    "Bayanihan Foundation", "Quezon City", "Helping communities"
  );
  userRepo.updateOrgStatus(org1Id, "APPROVED");

  // Create events for Org 1
  eventRepo.create({
    id: uuidv4(),
    organizer_id: org1Id,
    title: "Community Pantry",
    description: "Help distribute food to those in need.",
    location: "QC Circle",
    start_date: "2026-06-01 08:00",
    end_date: "2026-06-01 12:00",
    slots_available: 10,
    image_url: "",
  });

  eventRepo.create({
    id: uuidv4(),
    organizer_id: org1Id,
    title: "River Clean Up",
    description: "Cleaning the local river and surrounding areas.",
    location: "Pasig River",
    start_date: "2026-06-02 06:00",
    end_date: "2026-06-02 10:00",
    slots_available: 20,
    image_url: "",
  });

  // 4. Organization 2 — stays PENDING
  userRepo.createOrganization(
    uuidv4(), "org2@test.com", hash, today,
    "Tulong Kabataan", "Manila", "Youth empowerment programs"
  );

  console.log("✅ Demo data seeded successfully!");
  console.log("   Demo accounts (password: 'password'):"); 
  console.log("   • admin@test.com (Admin)");
  console.log("   • vol1@test.com  (Volunteer)");
  console.log("   • vol2@test.com  (Volunteer)");
  console.log("   • org1@test.com  (Organization — Approved)");
  console.log("   • org2@test.com  (Organization — Pending)");
}
