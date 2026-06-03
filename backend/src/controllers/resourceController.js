// src/controllers/resourceController.js
import prisma from "../db.js";

// ── Helper: build resource include ───────────────────────────────────────────
const INCLUDE = {
  department: { select: { name: true } },
  type:       { select: { name: true } },
};

// ── Helper: format resource for API response (flatten dept/type) ──────────────
function formatResource(r) {
  return {
    id:              r.id,
    name:            r.name,
    department:      r.department.name,
    type:            r.type.name,
    unlockCondition: r.unlockCondition,
    rating:          r.rating,
    views:           r.views,
    dateAdded:       r.dateAdded?.toISOString().split("T")[0] ?? null,
  };
}

// ── Helper: resolve department/type names to IDs ──────────────────────────────
async function resolveIds(departmentName, typeName) {
  const [dept, type] = await Promise.all([
    prisma.department.findUnique({ where: { name: departmentName } }),
    prisma.resourceType.findUnique({ where: { name: typeName } }),
  ]);
  if (!dept) throw new Error(`Department not found: ${departmentName}`);
  if (!type) throw new Error(`Type not found: ${typeName}`);
  return { departmentId: dept.id, typeId: type.id };
}

// ── GET /api/resources ────────────────────────────────────────────────────────
// Supports: page, pageSize, department, type, search, sortBy, order
export async function getResources(req, res) {
  try {
    const page       = parseInt(req.query.page)     || 1;
    const pageSize   = parseInt(req.query.pageSize) || 10;
    const department = req.query.department;
    const type       = req.query.type;
    const search     = req.query.search;
    const sortBy     = req.query.sortBy  || "dateAdded";
    const order      = req.query.order   || "desc";

    // Build where clause (filters)
    const where = {};
    if (department) where.department = { name: department };
    if (type)       where.type       = { name: type };
    if (search) {
      where.OR = [
        { name:            { contains: search, mode: "insensitive" } },
        { unlockCondition: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy;
    if (sortBy === "department") orderBy = { department: { name: order } };
    else if (sortBy === "type")  orderBy = { type:       { name: order } };
    else                         orderBy = { [sortBy]: order };

    const [total, data] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        include: INCLUDE,
        orderBy,
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
    ]);

    return res.json({
      data:       data.map(formatResource),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext:    page * pageSize < total,
        hasPrev:    page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── GET /api/resources/:id ────────────────────────────────────────────────────
export async function getResourceById(req, res) {
  try {
    const resource = await prisma.resource.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: INCLUDE,
    });
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    return res.json(formatResource(resource));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── POST /api/resources ───────────────────────────────────────────────────────
export async function createResource(req, res) {
  try {
    const { name, department, type, unlockCondition, rating, views, dateAdded } = req.body;
    const { departmentId, typeId } = await resolveIds(department, type);

    const resource = await prisma.resource.create({
      data: {
        name,
        unlockCondition,
        rating:       parseFloat(rating),
        views:        parseInt(views) || 0,
        dateAdded:    dateAdded ? new Date(dateAdded) : new Date(),
        departmentId,
        typeId,
      },
      include: INCLUDE,
    });

    return res.status(201).json(formatResource(resource));
  } catch (err) {
    console.error(err);
    if (err.message.includes("not found")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── PUT /api/resources/:id ────────────────────────────────────────────────────
export async function updateResource(req, res) {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Resource not found" });

    const { name, department, type, unlockCondition, rating, views, dateAdded } = req.body;
    const { departmentId, typeId } = await resolveIds(department, type);

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name,
        unlockCondition,
        rating:       parseFloat(rating),
        views:        parseInt(views) || 0,
        dateAdded:    dateAdded ? new Date(dateAdded) : existing.dateAdded,
        departmentId,
        typeId,
      },
      include: INCLUDE,
    });

    return res.json(formatResource(updated));
  } catch (err) {
    console.error(err);
    if (err.message.includes("not found")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── DELETE /api/resources/:id ─────────────────────────────────────────────────
export async function deleteResource(req, res) {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Resource not found" });

    await prisma.resource.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ── GET /api/resources/stats ──────────────────────────────────────────────────
export async function getStats(req, res) {
  try {
    const [total, byDept, byType, topRated, avgRating, totalViews] = await Promise.all([
      prisma.resource.count(),

      prisma.resource.groupBy({
        by: ["departmentId"],
        _count: { id: true },
        _avg:   { rating: true },
      }),

      prisma.resource.groupBy({
        by: ["typeId"],
        _count: { id: true },
      }),

      prisma.resource.findMany({
        orderBy: { rating: "desc" },
        take: 5,
        include: INCLUDE,
      }),

      prisma.resource.aggregate({ _avg: { rating: true } }),
      prisma.resource.aggregate({ _sum: { views: true } }),
    ]);

    // Enrich department stats with names
    const depts = await prisma.department.findMany();
    const deptMap = Object.fromEntries(depts.map(d => [d.id, d.name]));

    const types = await prisma.resourceType.findMany();
    const typeMap = Object.fromEntries(types.map(t => [t.id, t.name]));

    return res.json({
      total,
      avgRating:   avgRating._avg.rating ?? 0,
      totalViews:  totalViews._sum.views ?? 0,
      byDepartment: byDept.map(d => ({
        department: deptMap[d.departmentId],
        count:      d._count.id,
        avgRating:  d._avg.rating,
      })),
      byType: byType.map(t => ({
        type:  typeMap[t.typeId],
        count: t._count.id,
      })),
      topRated: topRated.map(formatResource),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
