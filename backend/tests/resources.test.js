// tests/resources.test.js
import request from "supertest";
import { app } from "../src/index.js";
import prisma from "../src/db.js";
import { sessions } from "../src/middleware/auth.js";
import { createHash } from "crypto";

function hashPassword(p) { return createHash("sha256").update(p).digest("hex"); }

let adminSession, userSession;

beforeAll(async () => {
  await prisma.actionLog.deleteMany();
  await prisma.suspiciousUser.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();
  await prisma.resourceType.deleteMany();

  for (const name of ["IT","Sales","HR","Management","Toate"])
    await prisma.department.upsert({ where:{name}, update:{}, create:{name} });
  for (const name of ["Video","Quiz","Course","Event"])
    await prisma.resourceType.upsert({ where:{name}, update:{}, create:{name} });

  const perms = ["READ_RESOURCES","CREATE_RESOURCE","UPDATE_RESOURCE","DELETE_RESOURCE","VIEW_STATS","MANAGE_USERS","VIEW_LOGS","VIEW_SUSPICIOUS"];
  for (const name of perms)
    await prisma.permission.upsert({ where:{name}, update:{}, create:{name} });

  const adminRole = await prisma.role.upsert({ where:{name:"ADMIN"}, update:{}, create:{name:"ADMIN"} });
  const userRole  = await prisma.role.upsert({ where:{name:"USER"},  update:{}, create:{name:"USER"} });
  const allPerms  = await prisma.permission.findMany();
  const permMap   = Object.fromEntries(allPerms.map(p=>[p.name,p.id]));

  for (const perm of allPerms)
    await prisma.rolePermission.upsert({
      where:{roleId_permissionId:{roleId:adminRole.id,permissionId:perm.id}},
      update:{}, create:{roleId:adminRole.id,permissionId:perm.id},
    });
  for (const permName of ["READ_RESOURCES","VIEW_STATS"])
    await prisma.rolePermission.upsert({
      where:{roleId_permissionId:{roleId:userRole.id,permissionId:permMap[permName]}},
      update:{}, create:{roleId:userRole.id,permissionId:permMap[permName]},
    });

  const itDept = await prisma.department.findUnique({ where:{name:"IT"} });
  await prisma.user.create({ data:{email:"admin@test.com",fullName:"Test Admin",passwordHash:hashPassword("admin123"),roleId:adminRole.id,departmentId:itDept.id} });
  await prisma.user.create({ data:{email:"user@test.com",fullName:"Test User",passwordHash:hashPassword("user123"),roleId:userRole.id,departmentId:itDept.id} });
});

beforeEach(async () => {
  await prisma.resource.deleteMany();
  await prisma.actionLog.deleteMany();
  await prisma.suspiciousUser.deleteMany();
  sessions.clear();
  const a = await request(app).post("/api/auth/login").send({email:"admin@test.com",password:"admin123"});
  adminSession = a.body.sessionId;
  const u = await request(app).post("/api/auth/login").send({email:"user@test.com",password:"user123"});
  userSession = u.body.sessionId;
});

afterAll(async () => {
  await prisma.actionLog.deleteMany();
  await prisma.suspiciousUser.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.department.deleteMany();
  await prisma.resourceType.deleteMany();
  await prisma.$disconnect();
});

async function createResource(ov={}) {
  const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
    .send({name:"Test Resource",department:"IT",type:"Video",unlockCondition:"Test",rating:4.5,views:100,...ov});
  return res.body;
}

describe("GET /api/health", () => {
  test("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Auth - Login", () => {
  test("admin login succeeds", async () => {
    const res = await request(app).post("/api/auth/login").send({email:"admin@test.com",password:"admin123"});
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.user.role).toBe("ADMIN");
  });
  test("user login succeeds", async () => {
    const res = await request(app).post("/api/auth/login").send({email:"user@test.com",password:"user123"});
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("USER");
  });
  test("fails with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({email:"admin@test.com",password:"wrong"});
    expect(res.status).toBe(401);
  });
  test("fails with unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({email:"nobody@test.com",password:"pass"});
    expect(res.status).toBe(401);
  });
  test("fails with invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({email:"notanemail",password:"pass"});
    expect(res.status).toBe(400);
  });
});

describe("Auth - Me / Logout", () => {
  test("returns session info", async () => {
    const res = await request(app).get("/api/auth/me").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@test.com");
  });
  test("returns 401 without session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
  test("logout invalidates session", async () => {
    await request(app).post("/api/auth/logout").set("x-session-id",adminSession);
    const res = await request(app).get("/api/auth/me").set("x-session-id",adminSession);
    expect(res.status).toBe(401);
  });
});

describe("Resources - Auth", () => {
  test("returns 401 without session", async () => {
    const res = await request(app).get("/api/resources");
    expect(res.status).toBe(401);
  });
  test("user cannot create", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",userSession)
      .send({name:"Test",department:"IT",type:"Video",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(403);
  });
  test("user can read", async () => {
    const res = await request(app).get("/api/resources").set("x-session-id",userSession);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/resources", () => {
  test("returns empty list", async () => {
    const res = await request(app).get("/api/resources").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
  test("returns paginated results", async () => {
    await createResource({name:"Resource A", department:"IT"});
    await createResource({name:"Resource B", department:"HR"});
    // verify both exist first
    const all = await request(app).get("/api/resources").set("x-session-id",adminSession);
    expect(all.body.pagination.total).toBe(2);
    // now test pagination
    const res = await request(app).get("/api/resources?page=1&pageSize=1").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(2);
  });
  test("filters by department", async () => {
    await createResource({department:"IT"}); await createResource({department:"HR"});
    const res = await request(app).get("/api/resources?department=IT").set("x-session-id",adminSession);
    expect(res.body.data).toHaveLength(1);
  });
  test("filters by type", async () => {
    await createResource({type:"Video"}); await createResource({type:"Quiz"});
    const res = await request(app).get("/api/resources?type=Video").set("x-session-id",adminSession);
    expect(res.body.data.every(r=>r.type==="Video")).toBe(true);
  });
  test("searches by name", async () => {
    await createResource({name:"Yoga"}); await createResource({name:"Leadership"});
    const res = await request(app).get("/api/resources?search=yoga").set("x-session-id",adminSession);
    expect(res.body.data).toHaveLength(1);
  });
  test("rejects invalid page", async () => {
    const res = await request(app).get("/api/resources?page=abc").set("x-session-id",adminSession);
    expect(res.status).toBe(400);
  });
  test("rejects invalid department filter", async () => {
    const res = await request(app).get("/api/resources?department=BadDept").set("x-session-id",adminSession);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/resources", () => {
  test("creates with valid data", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({name:"New",department:"IT",type:"Video",unlockCondition:"Test",rating:4.5});
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New");
  });
  test("fails without name", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({department:"IT",type:"Video",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(400);
  });
  test("fails with rating above 5", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({name:"Test",department:"IT",type:"Video",unlockCondition:"Test",rating:6});
    expect(res.status).toBe(400);
  });
  test("fails with rating below 0", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({name:"Test",department:"IT",type:"Video",unlockCondition:"Test",rating:-1});
    expect(res.status).toBe(400);
  });
  test("fails with invalid department", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({name:"Test",department:"Finance",type:"Video",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(400);
  });
  test("fails with invalid type", async () => {
    const res = await request(app).post("/api/resources").set("x-session-id",adminSession)
      .send({name:"Test",department:"IT",type:"Podcast",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(400);
  });
});

describe("GET /api/resources/:id", () => {
  test("returns resource by id", async () => {
    const created = await createResource();
    const res = await request(app).get(`/api/resources/${created.id}`).set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Test Resource");
  });
  test("returns 404 for missing id", async () => {
    const res = await request(app).get("/api/resources/99999").set("x-session-id",adminSession);
    expect(res.status).toBe(404);
  });
  test("returns 400 for invalid id", async () => {
    const res = await request(app).get("/api/resources/abc").set("x-session-id",adminSession);
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/resources/:id", () => {
  test("admin updates resource", async () => {
    const created = await createResource();
    const res = await request(app).put(`/api/resources/${created.id}`).set("x-session-id",adminSession)
      .send({name:"Updated",department:"HR",type:"Course",unlockCondition:"Updated",rating:3.5});
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated");
  });
  test("returns 404 for missing id", async () => {
    const res = await request(app).put("/api/resources/99999").set("x-session-id",adminSession)
      .send({name:"Test",department:"IT",type:"Video",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(404);
  });
  test("user cannot update", async () => {
    const created = await createResource();
    const res = await request(app).put(`/api/resources/${created.id}`).set("x-session-id",userSession)
      .send({name:"Hack",department:"IT",type:"Video",unlockCondition:"Test",rating:4.0});
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/resources/:id", () => {
  test("admin deletes resource", async () => {
    const created = await createResource();
    const res = await request(app).delete(`/api/resources/${created.id}`).set("x-session-id",adminSession);
    expect(res.status).toBe(204);
  });
  test("user cannot delete", async () => {
    const created = await createResource();
    const res = await request(app).delete(`/api/resources/${created.id}`).set("x-session-id",userSession);
    expect(res.status).toBe(403);
  });
  test("returns 404 for missing id", async () => {
    const res = await request(app).delete("/api/resources/99999").set("x-session-id",adminSession);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/resources/stats", () => {
  test("returns statistics", async () => {
    await createResource({rating:4.0,views:100});
    await createResource({rating:5.0,views:200,department:"HR",type:"Course"});
    const res = await request(app).get("/api/resources/stats").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.totalViews).toBe(300);
    expect(res.body.byDepartment).toBeDefined();
    expect(res.body.topRated).toBeDefined();
  });
  test("returns zeros when empty", async () => {
    const res = await request(app).get("/api/resources/stats").set("x-session-id",adminSession);
    expect(res.body.total).toBe(0);
  });
});

describe("GOLD: GET /api/logs", () => {
  test("admin can view logs", async () => {
    await createResource();
    await new Promise(r => setTimeout(r, 200));
    const res = await request(app).get("/api/logs").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
  test("user cannot view logs", async () => {
    const res = await request(app).get("/api/logs").set("x-session-id",userSession);
    expect(res.status).toBe(403);
  });
  test("returns suspicious users list", async () => {
    const res = await request(app).get("/api/logs/suspicious").set("x-session-id",adminSession);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});