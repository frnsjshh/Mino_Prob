import { getDb } from "../database/db";
import {
  UserBase,
  AppUser,
  VolunteerUser,
  OrganizationUser,
  AdminUser,
} from "../types/entities";

export class UserRepository {
  findByEmail(email: string): AppUser | undefined {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as UserBase | undefined;
    if (!row) return undefined;
    return this.hydrateUser(row);
  }

  findById(id: string): AppUser | undefined {
    const db = getDb();
    const row = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(id) as UserBase | undefined;
    if (!row) return undefined;
    return this.hydrateUser(row);
  }

  findAllOrganizations(): OrganizationUser[] {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT u.*, o.name AS org_name, o.location, o.description, o.status
         FROM users u JOIN organizations o ON u.id = o.user_id
         WHERE u.role = 'organization'`
      )
      .all() as OrganizationUser[];
    return rows;
  }

  findAllVolunteers(): VolunteerUser[] {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT u.*, v.first_name, v.last_name
         FROM users u JOIN volunteers v ON u.id = v.user_id
         WHERE u.role = 'volunteer'`
      )
      .all() as VolunteerUser[];
    return rows;
  }

  createVolunteer(
    id: string,
    email: string,
    passwordHash: string,
    joinDate: string,
    firstName: string,
    lastName: string
  ): void {
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO users (id, email, password_hash, role, join_date) VALUES (?, ?, ?, 'volunteer', ?)`
      ).run(id, email, passwordHash, joinDate);
      db.prepare(
        `INSERT INTO volunteers (user_id, first_name, last_name) VALUES (?, ?, ?)`
      ).run(id, firstName, lastName);
    });
    tx();
  }

  createOrganization(
    id: string,
    email: string,
    passwordHash: string,
    joinDate: string,
    name: string,
    location: string,
    description: string
  ): void {
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO users (id, email, password_hash, role, join_date) VALUES (?, ?, ?, 'organization', ?)`
      ).run(id, email, passwordHash, joinDate);
      db.prepare(
        `INSERT INTO organizations (user_id, name, location, description, status) VALUES (?, ?, ?, ?, 'PENDING')`
      ).run(id, name, location, description);
    });
    tx();
  }

  createAdmin(
    id: string,
    email: string,
    passwordHash: string,
    joinDate: string,
    firstName: string,
    lastName: string
  ): void {
    const db = getDb();
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO users (id, email, password_hash, role, join_date) VALUES (?, ?, ?, 'admin', ?)`
      ).run(id, email, passwordHash, joinDate);
      db.prepare(
        `INSERT INTO admins (user_id, first_name, last_name) VALUES (?, ?, ?)`
      ).run(id, firstName, lastName);
    });
    tx();
  }

  updateProfile(
    id: string,
    updates: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      profile_pic?: string;
    }
  ): void {
    const db = getDb();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.facebook !== undefined) {
      fields.push("facebook = ?");
      values.push(updates.facebook);
    }
    if (updates.instagram !== undefined) {
      fields.push("instagram = ?");
      values.push(updates.instagram);
    }
    if (updates.linkedin !== undefined) {
      fields.push("linkedin = ?");
      values.push(updates.linkedin);
    }
    if (updates.profile_pic !== undefined) {
      fields.push("profile_pic = ?");
      values.push(updates.profile_pic);
    }

    if (fields.length > 0) {
      values.push(id);
      db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(
        ...values
      );
    }
  }

  updateVolunteerDetails(
    userId: string,
    firstName: string,
    lastName: string
  ): void {
    const db = getDb();
    db.prepare(
      `UPDATE volunteers SET first_name = ?, last_name = ? WHERE user_id = ?`
    ).run(firstName, lastName, userId);
  }

  updateOrgDetails(
    userId: string,
    name: string,
    location: string,
    description: string
  ): void {
    const db = getDb();
    db.prepare(
      `UPDATE organizations SET name = ?, location = ?, description = ? WHERE user_id = ?`
    ).run(name, location, description, userId);
  }

  updateOrgStatus(
    userId: string,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ): void {
    const db = getDb();
    db.prepare(`UPDATE organizations SET status = ? WHERE user_id = ?`).run(
      status,
      userId
    );
  }

  deactivateUser(userId: string): void {
    const db = getDb();
    db.prepare(`UPDATE users SET active = 0 WHERE id = ?`).run(userId);
  }

  private hydrateUser(row: UserBase): AppUser {
    const db = getDb();
    if (row.role === "volunteer") {
      const vol = db
        .prepare("SELECT * FROM volunteers WHERE user_id = ?")
        .get(row.id) as { first_name: string; last_name: string } | undefined;
      return {
        ...row,
        role: "volunteer" as const,
        first_name: vol?.first_name ?? "",
        last_name: vol?.last_name ?? "",
      };
    }
    if (row.role === "organization") {
      const org = db
        .prepare("SELECT * FROM organizations WHERE user_id = ?")
        .get(row.id) as
        | {
            name: string;
            location: string;
            description: string;
            status: "PENDING" | "APPROVED" | "REJECTED";
          }
        | undefined;
      return {
        ...row,
        role: "organization" as const,
        org_name: org?.name ?? "",
        location: org?.location ?? "",
        description: org?.description ?? "",
        status: org?.status ?? "PENDING",
      };
    }
    // admin
    const adm = db
      .prepare("SELECT * FROM admins WHERE user_id = ?")
      .get(row.id) as { first_name: string; last_name: string } | undefined;
    return {
      ...row,
      role: "admin" as const,
      first_name: adm?.first_name ?? "",
      last_name: adm?.last_name ?? "",
    };
  }
}
