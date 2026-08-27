// Project controller - handles business logic for project routes
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to generate a slug from a title
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// GET /api/projects - get all projects
const getProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      _count: { select: { images: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
  res.status(200).json({
    status: "success",
    message: "Get all projects",
    data: projects,
  });
};

// GET /api/projects/:slug - get a single project by slug
const getProject = async (req, res) => {
  const { slug } = req.params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!project) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Get project",
    data: project,
  });
};

// POST /api/projects/quick - quick create a project with essential fields
const quickCreateProject = async (req, res) => {
  const { title, companyId } = req.body;

  if (!title || !companyId) {
    return res.status(400).json({
      status: "error",
      message: "Title and companyId are required",
    });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });

  if (!company) {
    return res.status(404).json({
      status: "error",
      message: "Company not found",
    });
  }

  const project = await prisma.project.create({
    data: {
      title,
      slug: slugify(title),
      companyId,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Project created successfully",
    data: project,
  });
};

// PATCH /api/projects/:id - update project (rest of the info)
const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    client,
    role,
    location,
    projectDate,
    sortOrder,
  } = req.body;

  const existing = await prisma.project.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: title ? slugify(title) : undefined,
      description,
      client,
      role,
      location,
      projectDate: projectDate ? new Date(projectDate) : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Project updated successfully",
    data: project,
  });
};

// PATCH /api/projects/:id/flags - update published/featured flags
const updateProjectFlags = async (req, res) => {
  const { id } = req.params;
  const { published, featured } = req.body;

  const existing = await prisma.project.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      published: published !== undefined ? Boolean(published) : undefined,
      featured: featured !== undefined ? Boolean(featured) : undefined,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Project flags updated successfully",
    data: {
      id: project.id,
      published: project.published,
      featured: project.featured,
    },
  });
};

// POST /api/projects/:id/main-image - upload the main project image
const uploadMainImage = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.project.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No image file uploaded",
    });
  }

  const mainImageUrl = `/uploads/projects/${req.file.filename}`;

  const project = await prisma.project.update({
    where: { id },
    data: { mainImage: mainImageUrl },
  });

  res.status(200).json({
    status: "success",
    message: "Main image uploaded successfully",
    data: { mainImage: project.mainImage },
  });
};

// POST /api/projects/:id/images - upload multiple project images
const uploadProjectImages = async (req, res) => {
  const { id } = req.params;
  const { captions, columns, sortOrders } = req.body;

  const existing = await prisma.project.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No images uploaded",
    });
  }

  const captionList =
    captions && Array.isArray(captions)
      ? captions
      : captions
        ? [captions]
        : [];
  const columnsList =
    columns && Array.isArray(columns)
      ? columns.map(Number)
      : columns
        ? [Number(columns)]
        : [];
  const sortOrderList =
    sortOrders && Array.isArray(sortOrders)
      ? sortOrders.map(Number)
      : sortOrders
        ? [Number(sortOrders)]
        : [];

  // Build image records for each uploaded file
  const imagesData = req.files.map((file, index) => ({
    image: `/uploads/projects/${file.filename}`,
    caption: captionList[index] || null,
    columns: columnsList[index] || 12,
    sortOrder: sortOrderList[index] || index,
    projectId: id,
  }));

  await prisma.projectImage.createMany({
    data: imagesData,
  });

  const images = await prisma.projectImage.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  res.status(201).json({
    status: "success",
    message: "Project images uploaded successfully",
    data: images,
  });
};

module.exports = {
  getProjects,
  getProject,
  quickCreateProject,
  updateProject,
  updateProjectFlags,
  uploadMainImage,
  uploadProjectImages,
};
