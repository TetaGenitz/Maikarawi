# SiKerja — Sistem Kehadiran Pegawai Pemerintah

## Original Problem Statement
Production-ready web-based Employee Attendance Management System for a government office (Bahasa Indonesia). Features: check-in/out with GPS geofence + selfie, WFO/WFH, work plans, activity output, leave, holidays, weekly/monthly/individual reports, Excel & PDF export, admin CRUD for employees/departments/locations/holidays, login page customization, government advertisement banner.

## User Choices
- Language: Bahasa Indonesia
- Auth: JWT-based custom (separate admin & employee login)
- Selfie storage: base64 in MongoDB
- MVP scope: Core end-to-end
- Branding: Maroon institutional (#800000) + white/gray neutral

## Architecture
- Backend: FastAPI + Motor + MongoDB (all endpoints under /api)
- Frontend: React + React Router + Shadcn UI + Recharts + Sonner + Tailwind
- Fonts: Outfit (headings), IBM Plex Sans (body)
- Storage: base64 selfies in Mongo (small MVP scale)

## Personas
- Administrator: manages employees, attendance, reports, settings
- Pegawai (Employee): checks in/out, submits work plan & activity output, views own history, requests leave

## Implemented (2026-02-18 / 08-18 UTC)
- JWT auth for admin & employee with role-guarded routes
- Admin dashboard: 8 stat cards, 7-day trend chart, department bar chart, today's attendance table
- Employee mobile dashboard: live clock, WFO/WFH selector, tactile CHECK IN / CHECK OUT flows with GPS + Selfie modal
- Selfie capture (front camera, preview, retake, confirm) via getUserMedia
- GPS geofence verification (haversine) with configurable radius per office location
- Check-out flow captures activity, output, status, notes
- Employee CRUD (with linked user account seeding), Departments CRUD, Office Locations CRUD, Holidays CRUD
- Daily Work Plan (multi-item) per employee with priority/target
- Leave request + admin approve/reject; approved leave blocks check-in
- Weekly and Monthly reports with filters (employee, department), summary cards, table
- Real Excel export (openpyxl) and PDF export (reportlab, landscape A4)
- System settings: office name, primary color, iklan (banner image/title/description/URL), attendance rules (start/end time, late threshold, min work minutes)
- Login page customization pulled from `/api/settings` (banner image + title + description)
- Change password for employees
- Seed: 1 admin + 3 employees + 3 departments + 1 office location + 3 holidays

## Backlog (Deferred)
- P1: Individual employee detailed report page with selfie viewer + GPS map
- P1: Audit logs UI (backend model exists conceptually but not wired)
- P2: File attachments for leave requests (real upload endpoint)
- P2: Excel/PDF department-specific templates
- P2: Multi-language toggle
- P2: Deactivated employee token invalidation middleware
- P2: Brute-force lockout on login endpoints
- P2: Split server.py into modules (auth/attendance/reports)

## Credentials
See /app/memory/test_credentials.md
