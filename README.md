# School Assignment Portal

A full-stack school management and assignment portal with role-based dashboards for administrators, teachers, and students.

---

## Features

- **Role-based Authentication**: Separate dashboards and permissions for Admin, Teacher, and Student.
- **Class & Subject Management**: Admins can create/manage classes and subjects.
- **Assignment Management**: Admins and teachers can create MCQ or written assignments for specific classes/subjects.
- **Submission & Grading**: Students submit assignments; MCQs are auto-graded, written assignments are graded by teachers.
- **Performance Tracking**: Students and teachers can view scores and progress.
- **Modern UI**: Built with React, Tailwind CSS, and Lucide icons.

---

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (role-based)
- **Dev Tools**: ESLint, Nodemon, Concurrently

---

## Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm

---

## Installation & Setup

### 1. Install MySQL


### 2. Clone and Install Dependencies

```sh
git clone <repository-url>
cd school-portal
npm install
```

### 3. Database Setup

1. **Configure MySQL Password**:  
   Edit `/server/database/init.js` and set your MySQL root password if needed.

2. **Create Database and Tables**:  
   You can use the provided SQL scripts:

   - `server/database/create_mysql_database.sql` (create DB and tables)
   - `server/database/schema.sql` (table structure)
   - `server/database/seed.sql` (sample data)

   Or, simply start the backend server and it will initialize the schema and seed data automatically.

### 4. Environment Configuration

Update the `.env` file if needed (default values are provided):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_portal
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=school_portal_secret_key_change_in_production
PORT=5000
```

### 5. Start the Application

```sh
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## Project Structure

```
.
├── server/              # Express backend (routes, database, middleware)
│   ├── routes/
│   ├── database/
│   └── middleware/
├── src/                 # React frontend (components, pages, utils)
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   └── utils/
├── package.json         # Scripts & dependencies
└── ...
```

---

## Test Accounts

After running the setup, you can log in with:

- **Admin**: admin@school.com / password123
- **Teacher**: john.teacher@school.com / password123
- **Student**: alice.student@school.com / password123

---

## Usage

### Admin Dashboard
- Manage users (create, edit, delete)
- Manage classes and subjects
- Create assignments for classes/subjects
- View all submissions and performance data

### Teacher Dashboard
- View assigned classes and subjects
- See student lists
- Review and grade written submissions
- View class performance
- MCQ assignments are auto-graded

### Student Dashboard
- View assigned subjects
- Complete and submit assignments
- Track scores and submission history

---

## Database Schema

Main tables:

- `users` — All users (admin, teacher, student)
- `classes` — School classes/grades
- `subjects` — Subjects per class
- `students` — Student records
- `teachers` — Teacher records
- `assignments` — Assignment details
- `questions` — Assignment questions (MCQ/written)
- `submissions` — Student submissions
- `marks` — Per-question marks

See `/server/database/` for full schema and sample data.

---

## Troubleshooting

### Database Issues

- Ensure MySQL is running.
- Check credentials in `.env` and `/server/database/init.js`.
- To reset the database, you can drop and recreate it using the provided SQL scripts.

### Common Problems

- **Port conflicts**: Change `PORT` in `.env` if needed.
- **Module not found**: Run `npm install`.
- **Permission denied**: Ensure your MySQL user has DB privileges.

---

## Development

- **Run both servers:** `npm run dev`
- **Lint code:** `npm run lint`
- **Build frontend:** `npm run build`

---

## Production Deployment

1. Update `.env` for production.
2. Change `JWT_SECRET` to a secure value.
3. Build frontend: `npm run build`
4. Use a process manager (e.g., PM2) for the backend.

---

## License

This project is for educational purposes only.