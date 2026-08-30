// Project controller - handles business logic for project routes
const fs = require("fs");
const path = require("path");
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

// Relative URL -> absolute file path inside the public folder
const publicRoot = path.join(__dirname, "..", "public");

const filePathFromUrl = (url) => {
  if (!url) return null;
  // Strip the leading slash and resolve against the public folder
  const relative = url.replace(/^\/+/, "");
  return path.join(publicRoot, relative);
};

// Delete a file from disk if it exists (best-effort, ignores errors)
const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Failed to delete file:", filePath, err);
  }
};

// Delete the whole project folder from disk if it exists
const deleteProjectFolder = (projectId) => {
  const dir = path.join(publicRoot, "uploads", "projects", projectId);
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("Failed to delete project folder:", dir, err);
  }
};

// GET /api/projects - get all projects
const getProjects = async (req, res) => {
  console.log("getProjects called with companyId:", req.query.companyId); // Debugging line
  const projects = await prisma.project.findMany({
    where: {
      // published: true,
      companyId: req.query.companyId || undefined,
    },
    include: {
      company: { select: { id: true, name: true, slug: true } },
      _count: { select: { images: true } },
    },
    orderBy: { sortOrder: "desc" },
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
      published: false,
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
    category,
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
      category: category || undefined,
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

  // Delete the previous main image file if it exists
  if (existing.mainImage) {
    deleteFile(filePathFromUrl(existing.mainImage));
  }

  // Store under the dedicated project folder: /uploads/projects/:id/...
  const mainImageUrl = `/uploads/projects/${id}/${req.file.filename}`;

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
    captions && Array.isArray(captions) ? captions : captions ? [captions] : [];
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
    image: `/uploads/projects/${id}/${file.filename}`,
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

// POST /api/projects/:id/images/reorder - reorder project images (update sortOrder)
const reorderProjectImages = async (req, res) => {
  const { id } = req.params;
  const { orderedIds } = req.body; // array of image ids in the new order

  const existing = await prisma.project.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "orderedIds array is required",
    });
  }

  // Update each image's sortOrder based on its index in the ordered list.
  const updates = orderedIds.map((imageId, index) =>
    prisma.projectImage.update({
      where: { id: imageId },
      data: { sortOrder: index },
    }),
  );

  await prisma.$transaction(updates);

  const images = await prisma.projectImage.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: "asc" },
  });

  res.status(200).json({
    status: "success",
    message: "Project images reordered successfully",
    data: images,
  });
};

// PATCH /api/projects/images/:imageId - update a project image's columns/caption/sortOrder
const updateProjectImage = async (req, res) => {
  const { imageId } = req.params;
  const { caption, columns, sortOrder } = req.body;

  const image = await prisma.projectImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return res.status(404).json({
      status: "error",
      message: "Project image not found",
    });
  }

  const updated = await prisma.projectImage.update({
    where: { id: imageId },
    data: {
      caption: caption !== undefined ? caption : undefined,
      columns: columns !== undefined ? Number(columns) : undefined,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Project image updated successfully",
    data: {
      id: updated.id,
      image: updated.image,
      caption: updated.caption,
      columns: updated.columns,
      sortOrder: updated.sortOrder,
    },
  });
};

// DELETE /api/projects/images/:imageId - delete a single project image
const deleteProjectImage = async (req, res) => {
  const { imageId } = req.params;

  const image = await prisma.projectImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    return res.status(404).json({
      status: "error",
      message: "Project image not found",
    });
  }

  // Delete the image file from disk
  deleteFile(filePathFromUrl(image.image));

  // Delete the DB record
  await prisma.projectImage.delete({ where: { id: imageId } });

  res.status(200).json({
    status: "success",
    message: "Project image deleted successfully",
  });
};

// DELETE /api/projects/:id - delete the project, its images, and files
const deleteProject = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Project not found",
    });
  }

  // Delete all gallery image files from disk
  if (existing.images.length > 0) {
    existing.images.forEach((img) => deleteFile(filePathFromUrl(img.image)));
  }

  // Delete the main image file from disk
  if (existing.mainImage) {
    deleteFile(filePathFromUrl(existing.mainImage));
  }

  // Delete the whole project folder (in case anything is left)
  deleteProjectFolder(id);

  // Cascade deletes ProjectImage records + the Project row (schema onDelete: Cascade)
  await prisma.project.delete({ where: { id } });

  res.status(200).json({
    status: "success",
    message: "Project deleted successfully",
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
  reorderProjectImages,
  updateProjectImage,
  deleteProjectImage,
  deleteProject,
};
