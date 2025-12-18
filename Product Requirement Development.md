# PRD – BIGASI  
## BINA BUGAR PRESTASI

---

## 1. Product Overview

**Product Name**  
BIGASI (Bina Bugar Prestasi)

**Description**  
BIGASI is a **mobile-first web application** designed to help school administration manage and monitor **athlete fitness, training progress, and sports performance**. The system connects **administrators, coaches, and parents** in one integrated platform.

**Platform**
- Web Application (Mobile-first) and responsive

**Technology Stack**
- Frontend: Vue 3 + bootstrap
- Backend & Database: Supabase
- Authentication: Supabase Auth
- Storage: Supabase Storage (Athlete & Coach photos)

---

## 2. Product Goals

- Monitor athlete training and development
- Provide transparent progress reports to parents
- Support coaches in evaluating athletes
- Manage sports-related payments
- Publish sports events and competitions

---

## 3. User Roles

### 3.1 Admin
- Manage athletes, coaches, and sports
- Manage parent accounts
- Manage payments
- Manage events
- Full system access

### 3.2 Coach
- Manage training notes
- Input semester reports
- View assigned athletes
- View events

### 3.3 Parent
- View athlete profile and progress
- View training notes
- View reports
- View payment history
- View events

---

## 4. Core Features

---

## 4.1 Authentication & Authorization
- Email & password login
- Role-based access control
- Secure data isolation per role

---

## 4.2 Athlete Management

### Admin
- Create, update, and deactivate athletes
- Assign athletes to sports
- Upload athlete photos

### Athlete Data
- Full name
- Athlete number
- Class
- Gender
- Photo
- Parent account
- Active status

---

## 4.3 Coach Management

### Admin
- Create and manage coach profiles
- Upload coach photos

---

## 4.4 Sports Management

- Manage sports branches
- Assign coaches to sports
- Assign athletes to sports

---

## 4.5 Payments

### Admin
- Manual payment input
- Define payment types and periods

### Parent
- View payment history and status

---

## 4.6 Training Notes

### Coach
- Add training notes per session

### Admin & Parent
- View athlete training notes

---

## 4.7 Semester Reports

### Coach
- Input final score and evaluation note

### Parent
- View athlete semester report

---

## 4.8 Events

### Admin
- Create sports events and competitions

### Coach & Parent
- View upcoming events

---
## 4.9 Registration User Page

### Admin
- Assign roles
- Confirm Registration

### Parent
- Register Account using username/email/phone_number connected with athlete name

## 4.10 Setting App

### Admin
- Setting app name, logo, primary color, and secondary color
- upload logo
---
## 5. Non-Functional Requirements

- Mobile-first UI
- Secure role-based access
- Optimized image storage
- Fast load time (< 3s)
- Scalable architecture

---

## 6. Future Enhancements

- Training performance charts
- Notification system (WhatsApp / Email)
- Media gallery for training sessions
- PDF report export

## 7. Project Structure
src/
├─ assets/
│  └─ styles/
│     └─ theme.css        # warna dari app_settings
│
├─ components/
│  ├─ base/
│  │  ├─ BaseButton.vue
│  │  └─ BaseInput.vue
│  │
│  ├─ layout/
│  │  ├─ AppHeader.vue
│  │  └─ AppSidebar.vue
│  │
│  └─ common/
│     └─ AppLogo.vue
│
├─ composables/
│  ├─ useAuth.js
│  ├─ useSettings.js
│  └─ useUpload.js
│
├─ lib/
│  └─ supabase.js
│
├─ pages/
│  ├─ auth/
│  │  └─ Login.vue
│  │
│  ├─ admin/
│  │  ├─ Dashboard.vue
│  │  └─ Settings.vue
│  │
│  ├─ coach/
│  │  └─ Dashboard.vue
│  │
│  └─ parent/
│     └─ Dashboard.vue
│
├─ router/
│  └─ index.js
│
├─ App.vue
└─ main.js

## table
-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "uuid-ossp";

-- =========================
-- USERS (PROFILE & ROLE)
-- =========================
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN', 'COACH', 'PARENT')),
  full_name text not null,
  email text unique not null,
  photo_url text,
  created_at timestamp with time zone default now()
);

-- =========================
-- COACHES
-- =========================
create table coaches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references app_users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  photo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- =========================
-- ATHLETES
-- =========================
create table athletes (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  athlete_number text unique not null,
  class_name text,
  gender text,
  photo_url text,
  parent_user_id uuid references app_users(id),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- =========================
-- SPORTS
-- =========================
create table sports (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  coach_id uuid references coaches(id),
  schedule text,
  description text,
  created_at timestamp with time zone default now()
);

-- =========================
-- ATHLETE - SPORTS RELATION
-- =========================
create table athlete_sports (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references athletes(id) on delete cascade,
  sport_id uuid references sports(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (athlete_id, sport_id)
);

-- =========================
-- PAYMENTS
-- =========================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references athletes(id) on delete cascade,
  payment_type text,
  period text,
  amount numeric(12,2),
  status text check (status in ('PAID', 'UNPAID')),
  created_by uuid references app_users(id),
  created_at timestamp with time zone default now()
);

-- =========================
-- TRAINING NOTES
-- =========================
create table training_notes (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references athletes(id) on delete cascade,
  sport_id uuid references sports(id),
  coach_id uuid references coaches(id),
  training_date date not null,
  attendance boolean,
  note text not null,
  created_at timestamp with time zone default now()
);

-- =========================
-- REPORTS
-- =========================
create table reports (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references athletes(id) on delete cascade,
  sport_id uuid references sports(id),
  semester text not null,
  score integer check (score between 0 and 100),
  coach_note text,
  created_at timestamp with time zone default now(),
  unique (athlete_id, sport_id, semester)
);

-- =========================
-- EVENTS
-- =========================
create table events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  event_type text,
  event_date date,
  location text,
  sport_id uuid references sports(id),
  description text,
  created_at timestamp with time zone default now()
);

-- =========================
-- INDEXES
-- =========================
create index idx_athletes_parent on athletes(parent_user_id);
create index idx_payments_athlete on payments(athlete_id);
create index idx_training_notes_athlete on training_notes(athlete_id);
create index idx_reports_athlete on reports(athlete_id);

create table app_settings (
  id uuid primary key default uuid_generate_v4(),
  app_name text not null,
  logo_url text,
  primary_color text not null default '#2563eb',
  secondary_color text not null default '#22c55e',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

