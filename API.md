# Brandie Admin API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require an `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## AUTH & USERS

Base path: `/users`

### 1. Get All Users

- **Method:** `GET`
- **Endpoint:** `/users`
- **Auth:** None
- **Response (200):**

```json
{
  "status": "success",
  "message": "Get all users",
  "data": ["array of admin users"]
}
```

### 2. Create User

- **Method:** `POST`
- **Endpoint:** `/users`
- **Auth:** None
- **Body (JSON):**

```json
{ "name": "John", "email": "john@mail.com", "password": "secret123" }
```

- **Response (201):**

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": { "id": "cuid", "name": "John", "email": "john@mail.com" }
}
```

### 3. Sign In

- **Method:** `POST`
- **Endpoint:** `/users/signin`
- **Auth:** None
- **Body (JSON):**

```json
{ "email": "john@mail.com", "password": "secret123" }
```

- **Response (200):**

```json
{
  "status": "success",
  "message": "Signed in successfully",
  "data": {
    "token": "JWT_TOKEN",
    "user": { "id": "cuid", "name": "John", "email": "john@mail.com" }
  }
}
```

- **Error (401):** `{ "status": "error", "message": "Invalid email or password" }`

---

## COMPANIES

Base path: `/companies`

### 4. Get All Companies

- **Method:** `GET`
- **Endpoint:** `/companies`
- **Auth:** None
- **Response (200):**

```json
{
  "status": "success",
  "message": "Get all companies",
  "data": [
    {
      "id": "cuid",
      "name": "BrandCo",
      "slug": "brandco",
      "logo": null,
      "description": null,
      "website": null,
      "location": null,
      "createdAt": "...",
      "updatedAt": "...",
      "adminId": "cuid",
      "_count": { "projects": 0 }
    }
  ]
}
```

### 5. Get Single Company

- **Method:** `GET`
- **Endpoint:** `/companies/:slug`
- **Auth:** None
- **Response (200):**

```json
{
  "status": "success",
  "message": "Get company",
  "data": {
    "id": "cuid",
    "name": "BrandCo",
    "slug": "brandco",
    "logo": null,
    "description": "...",
    "website": "...",
    "location": "...",
    "projects": ["array of projects"]
  }
}
```

- **Error (404):** `{ "status": "error", "message": "Company not found" }`

### 6. Create Company

- **Method:** `POST`
- **Endpoint:** `/companies` _(Protected)_
- **Body (JSON):**

```json
{
  "name": "BrandCo",
  "description": "Optional",
  "website": "Optional",
  "location": "Optional"
}
```

- **Response (201):**

```json
{
  "status": "success",
  "message": "Company created successfully",
  "data": {
    "id": "cuid",
    "name": "BrandCo",
    "slug": "brandco",
    "adminId": "cuid"
  }
}
```

- **Error (400):** `{ "status": "error", "message": "Company name is required" }`

### 7. Update Company

- **Method:** `PATCH`
- **Endpoint:** `/companies/:id` _(Protected)_
- **Body (JSON):** any subset of

```json
{ "name": "NewName", "description": "...", "website": "...", "location": "..." }
```

- **Response (200):**

```json
{
  "status": "success",
  "message": "Company updated successfully",
  "data": { "company object" }
}
```

### 8. Upload Company Logo

- **Method:** `POST`
- **Endpoint:** `/companies/:id/logo` _(Protected)_
- **Content-Type:** `multipart/form-data`
- **Form Field:** `logo` (image file; jpg, jpeg, png, gif, webp, svg — max 5MB)
- **Response (200):**

```json
{
  "status": "success",
  "message": "Logo uploaded successfully",
  "data": { "logo": "/uploads/companies/logo-xxxx.jpg" }
}
```

---

## PROJECTS

Base path: `/projects`

### 9. Get All Projects

- **Method:** `GET`
- **Endpoint:** `/projects`
- **Auth:** None
- **Query Params (optional):** `?companyId=<cuid>` to filter by company
- **Response (200):**

```json
{
  "status": "success",
  "message": "Get all projects",
  "data": [
    {
      "id": "cuid",
      "title": "Title",
      "slug": "title",
      "mainImage": null,
      "category": "digital-marketing",
      "description": null,
      "client": null,
      "role": null,
      "location": null,
      "projectDate": null,
      "featured": false,
      "published": false,
      "sortOrder": 0,
      "company": { "id": "cuid", "name": "BrandCo", "slug": "brandco" },
      "_count": { "images": 0 }
    }
  ]
}
```

### 10. Get Single Project

- **Method:** `GET`
- **Endpoint:** `/projects/:slug`
- **Auth:** None
- **Response (200):**

```json
{
  "status": "success",
  "message": "Get project",
  "data": {
    "id": "cuid",
    "title": "Title",
    "slug": "title",
    "category": "digital-marketing",
    "company": { "id": "cuid", "name": "BrandCo", "slug": "brandco" },
    "images": ["array of project images"]
  }
}
```

- **Error (404):** `{ "status": "error", "message": "Project not found" }`

### 11. Quick Create Project

- **Method:** `POST`
- **Endpoint:** `/projects/quick` _(Protected)_
- **Body (JSON):**

```json
{ "title": "Project Title", "companyId": "cuid" }
```

- **Response (201):**

```json
{
  "status": "success",
  "message": "Project created successfully",
  "data": {
    "id": "cuid",
    "title": "Project Title",
    "slug": "project-title",
    "companyId": "cuid",
    "published": false
  }
}
```

### 12. Update Project

- **Method:** `PATCH`
- **Endpoint:** `/projects/:id` _(Protected)_
- **Body (JSON):** any subset of

```json
{
  "title": "New Title",
  "category": "digital-marketing",
  "description": "...",
  "client": "...",
  "role": "...",
  "location": "...",
  "projectDate": "2026-01-01",
  "sortOrder": 1
}
```

- **Response (200):**

```json
{
  "status": "success",
  "message": "Project updated successfully",
  "data": { "project object" }
}
```

### 13. Update Project Flags

- **Method:** `PATCH`
- **Endpoint:** `/projects/:id/flags` _(Protected)_
- **Body (JSON):** any subset of

```json
{ "published": true, "featured": true }
```

- **Response (200):**

```json
{
  "status": "success",
  "message": "Project flags updated successfully",
  "data": { "id": "cuid", "published": true, "featured": true }
}
```

### 14. Upload Main Image

- **Method:** `POST`
- **Endpoint:** `/projects/:id/main-image` _(Protected)_
- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` (file; jpg, jpeg, png, gif, webp — max 10MB)
- **Note:** Replaces the previous main image (old file is deleted).
- **Response (200):**

```json
{
  "status": "success",
  "message": "Main image uploaded successfully",
  "data": { "mainImage": "/uploads/projects/<id>/project-xxxx.jpg" }
}
```

### 15. Upload Project Images (Multiple)

- **Method:** `POST`
- **Endpoint:** `/projects/:id/images` _(Protected)_
- **Content-Type:** `multipart/form-data`
- **Form Field:** `images` (multiple files, up to 20; jpg, jpeg, png, gif, webp — max 10MB each)
- **Optional Fields:** `captions[]`, `columns[]`, `sortOrders[]`
- **Response (201):**

```json
{
  "status": "success",
  "message": "Project images uploaded successfully",
  "data": [
    {
      "id": "cuid",
      "image": "/uploads/projects/<id>/project-xxxx.jpg",
      "caption": null,
      "columns": 12,
      "sortOrder": 0
    }
  ]
}
```

### 16. Reorder Project Images

- **Method:** `POST`
- **Endpoint:** `/projects/:id/images/reorder` _(Protected)_
- **Body (JSON):**

```json
{ "orderedIds": ["imgId1", "imgId2", "imgId3"] }
```

- **Response (200):**

```json
{
  "status": "success",
  "message": "Project images reordered successfully",
  "data": ["array of images in new order"]
}
```

### 17. Delete Project Image

- **Method:** `DELETE`
- **Endpoint:** `/projects/images/:imageId` _(Protected)_
- **Note:** Deletes the file from disk and the DB record.
- **Response (200):**

```json
{ "status": "success", "message": "Project image deleted successfully" }
```

### 18. Delete Project

- **Method:** `DELETE`
- **Endpoint:** `/projects/:id` _(Protected)_
- **Note:** Deletes the project, all its images (files + DB), its main image, and the project folder.
- **Response (200):**

```json
{ "status": "success", "message": "Project deleted successfully" }
```

---

## Categories

Available project `category` values sent as dashes:

| Label             | Value               |
| ----------------- | ------------------- |
| UI/UX Design      | `ui-ux-design`      |
| Photography       | `photography`       |
| Digital Marketing | `digital-marketing` |
| Branding          | `branding`          |
| Web Development   | `web-development`   |
| Motion Graphics   | `motion-graphics`   |

---

## Error Format

All errors follow this shape:

```json
{
  "status": "error",
  "message": "Description of the error"
}
```
