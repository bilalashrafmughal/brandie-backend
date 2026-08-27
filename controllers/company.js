// Company controller - handles business logic for company routes
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to generate a slug from a name
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// GET /api/companies - get all companies
const getCompanies = async (req, res) => {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({
    status: "success",
    message: "Get all companies",
    data: companies,
  });
};

// GET /api/companies/:slug - get a single company by slug
const getCompany = async (req, res) => {
  const { slug } = req.params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: { projects: true },
  });

  if (!company) {
    return res.status(404).json({
      status: "error",
      message: "Company not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Get company",
    data: company,
  });
};

// POST /api/companies - create a company
const createCompany = async (req, res) => {
  const { name, description, website, location } = req.body;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Company name is required",
    });
  }

  // Use the authenticated admin's id
  const adminId = req.user.id;

  const company = await prisma.company.create({
    data: {
      name,
      slug: slugify(name),
      description,
      website,
      location,
      adminId,
    },
  });

  res.status(201).json({
    status: "success",
    message: "Company created successfully",
    data: company,
  });
};

// PATCH /api/companies/:id - update a company
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, description, website, location } = req.body;

  const existing = await prisma.company.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Company not found",
    });
  }

  const company = await prisma.company.update({
    where: { id },
    data: {
      name,
      slug: name ? slugify(name) : undefined,
      description,
      website,
      location,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Company updated successfully",
    data: company,
  });
};

// POST /api/companies/:id/logo - upload a company logo
const uploadLogo = async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.company.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({
      status: "error",
      message: "Company not found",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No logo file uploaded",
    });
  }

  // URL path to the uploaded file
  const logoUrl = `/uploads/companies/${req.file.filename}`;

  const company = await prisma.company.update({
    where: { id },
    data: { logo: logoUrl },
  });

  res.status(200).json({
    status: "success",
    message: "Logo uploaded successfully",
    data: { logo: company.logo },
  });
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  uploadLogo,
};
