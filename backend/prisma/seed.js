// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Departments ──────────────────────────────────────────────
  const departments = ["IT", "Sales", "HR", "Management", "Toate"];
  for (const name of departments) {
    await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }

  // ── ResourceTypes ────────────────────────────────────────────
  const types = ["Video", "Quiz", "Course", "Event"];
  for (const name of types) {
    await prisma.resourceType.upsert({ where: { name }, update: {}, create: { name } });
  }

  // ── Permissions ──────────────────────────────────────────────
  const permissions = [
    { name: "READ_RESOURCES",   description: "View wellness resources" },
    { name: "CREATE_RESOURCE",  description: "Add new resources" },
    { name: "UPDATE_RESOURCE",  description: "Edit existing resources" },
    { name: "DELETE_RESOURCE",  description: "Remove resources" },
    { name: "VIEW_STATS",       description: "Access statistics" },
    { name: "MANAGE_USERS",     description: "Admin: manage users" },
    { name: "VIEW_LOGS",        description: "Admin: view action logs" },
    { name: "VIEW_SUSPICIOUS",  description: "Admin: view suspicious users" },
    { name: "APPROVE_RESOURCE", description: "Manager: approve new resources" },
    { name: "VIEW_DEPARTMENT",  description: "Manager: view department resources" },
  ];
  for (const p of permissions) {
    await prisma.permission.upsert({ where: { name: p.name }, update: {}, create: p });
  }

  // ── Roles ────────────────────────────────────────────────────
  await prisma.role.upsert({ where: { name: "ADMIN" },   update: {}, create: { name: "ADMIN",   description: "Full access to all features" } });
  await prisma.role.upsert({ where: { name: "MANAGER" }, update: {}, create: { name: "MANAGER", description: "Department manager — approve resources, view stats" } });
  await prisma.role.upsert({ where: { name: "USER" },    update: {}, create: { name: "USER",    description: "Read-only access to resources" } });

  // ── Role Permissions ─────────────────────────────────────────
  const adminRole   = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const managerRole = await prisma.role.findUnique({ where: { name: "MANAGER" } });
  const userRole    = await prisma.role.findUnique({ where: { name: "USER" } });
  const allPerms    = await prisma.permission.findMany();
  const permMap     = Object.fromEntries(allPerms.map(p => [p.name, p.id]));

  // ADMIN gets ALL permissions
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {}, create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // MANAGER: read + create + update + approve + stats + department view
  for (const permName of ["READ_RESOURCES","CREATE_RESOURCE","UPDATE_RESOURCE","APPROVE_RESOURCE","VIEW_STATS","VIEW_DEPARTMENT"]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: managerRole.id, permissionId: permMap[permName] } },
      update: {}, create: { roleId: managerRole.id, permissionId: permMap[permName] },
    });
  }

  // USER: read + view stats only
  for (const permName of ["READ_RESOURCES","VIEW_STATS"]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: userRole.id, permissionId: permMap[permName] } },
      update: {}, create: { roleId: userRole.id, permissionId: permMap[permName] },
    });
  }

  // ── Users ────────────────────────────────────────────────────
  const itDept   = await prisma.department.findUnique({ where: { name: "IT" } });
  const hrDept   = await prisma.department.findUnique({ where: { name: "HR" } });
  const mgtDept  = await prisma.department.findUnique({ where: { name: "Management" } });

  await prisma.user.upsert({
    where: { email: "admin@wellsync.com" }, update: {},
    create: { email: "admin@wellsync.com", fullName: "WellSync Admin", passwordHash: hashPassword("admin123"), roleId: adminRole.id, departmentId: itDept.id },
  });

  await prisma.user.upsert({
    where: { email: "manager@wellsync.com" }, update: {},
    create: { email: "manager@wellsync.com", fullName: "Department Manager", passwordHash: hashPassword("manager123"), roleId: managerRole.id, departmentId: mgtDept.id },
  });

  await prisma.user.upsert({
    where: { email: "user@wellsync.com" }, update: {},
    create: { email: "user@wellsync.com", fullName: "John Employee", passwordHash: hashPassword("user123"), roleId: userRole.id, departmentId: hrDept.id },
  });

  // ── Resources ────────────────────────────────────────────────
  const deptMap = Object.fromEntries((await prisma.department.findMany()).map(d => [d.name, d.id]));
  const typeMap = Object.fromEntries((await prisma.resourceType.findMany()).map(t => [t.name, t.id]));

  const resources = [
    { name: "Focus & Clarity Video",     department: "IT",         type: "Video",  unlockCondition: "Scor Stres > 60%",     rating: 4.9, views: 234, dateAdded: new Date("2026-03-10") },
    { name: "Sales Resilience Quiz",     department: "Sales",      type: "Quiz",   unlockCondition: "După 4 ore muncă",     rating: 4.8, views: 456, dateAdded: new Date("2026-03-08") },
    { name: "Posture Check-up",          department: "Toate",      type: "Video",  unlockCondition: "Zilnic (Ora 11:00)",   rating: 4.7, views: 189, dateAdded: new Date("2026-03-05") },
    { name: "Mindful Leadership",        department: "Management", type: "Course", unlockCondition: "Scor Focus < 40%",     rating: 4.6, views: 312, dateAdded: new Date("2026-02-28") },
    { name: "Stress Management Workshop",department: "HR",         type: "Event",  unlockCondition: "Scor Stres > 70%",     rating: 4.5, views: 278, dateAdded: new Date("2026-02-20") },
    { name: "Healthy Work-Life Balance", department: "HR",         type: "Course", unlockCondition: "După 6 ore muncă",     rating: 4.4, views: 195, dateAdded: new Date("2026-02-15") },
    { name: "Team Building Activities",  department: "Management", type: "Event",  unlockCondition: "Săptămânal",           rating: 4.8, views: 401, dateAdded: new Date("2026-02-10") },
    { name: "Mental Health Awareness",   department: "HR",         type: "Video",  unlockCondition: "Scor Anxietate > 50%", rating: 4.3, views: 167, dateAdded: new Date("2026-02-05") },
    { name: "Ergonomics in Workplace",   department: "Sales",      type: "Video",  unlockCondition: "Zilnic (Ora 14:00)",   rating: 4.7, views: 223, dateAdded: new Date("2026-01-30") },
    { name: "Nutrition Basics",          department: "HR",         type: "Course", unlockCondition: "Scor Energie < 30%",   rating: 4.2, views: 145, dateAdded: new Date("2026-01-25") },
    { name: "Breathing Techniques",      department: "Toate",      type: "Video",  unlockCondition: "Oricând",              rating: 4.6, views: 389, dateAdded: new Date("2026-01-20") },
    { name: "Leadership Excellence",     department: "Management", type: "Course", unlockCondition: "Scor Focus < 50%",     rating: 4.5, views: 256, dateAdded: new Date("2026-01-15") },
  ];

  for (const r of resources) {
    await prisma.resource.create({
      data: {
        name: r.name, unlockCondition: r.unlockCondition,
        rating: r.rating, views: r.views, dateAdded: r.dateAdded,
        departmentId: deptMap[r.department], typeId: typeMap[r.type],
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   Admin:   admin@wellsync.com   / admin123");
  console.log("   Manager: manager@wellsync.com / manager123");
  console.log("   User:    user@wellsync.com    / user123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
