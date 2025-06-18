# School Assignment Portal

A comprehensive full-stack school management system with role-based dashboards for administrators, teachers, and students.

## Features

- **Role-based Authentication**: Admin, Teacher, and Student dashboards
- **Subject-aware Assignment Management**: Students select subjects before accessing assignments
- **Auto-grading System**: MCQ assignments are automatically graded
- **Manual Grading**: Teachers can manually grade written assignments
- **Class Management**: Organize users by classes and grade levels
- **Performance Tracking**: Students can view their scores and progress

## Tech Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access control

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Install PostgreSQL

**Windows**: Download from https://www.postgresql.org/download/windows/
**macOS**: `brew install postgresql && brew services start postgresql`
**Linux**: `sudo apt install postgresql postgresql-contrib`

### 2. Clone and Install Dependencies

```bash
git clone <repository-url>
cd school-assignment-portal
npm install
```

### 3. Database Setup

1. **Update Database Password**: Edit `setup-database.js` and change `your_postgres_password` to your actual PostgreSQL password.

2. **Run Database Setup**:
```bash
node setup-database.js
```

This will:
- Create the `school_portal` database
- Create a `school_user` with appropriate permissions
- Set up all tables and relationships
- Insert sample data for testing

### 4. Environment Configuration

The `.env` file is already configured with the database settings. Update if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_portal
DB_USER=school_user
DB_PASSWORD=school_password123
JWT_SECRET=school_portal_secret_key_change_in_production
PORT=5000
```

### 5. Start the Application

```bash
npm run dev
```

This starts both the frontend (port 5173) and backend (port 5000) servers.

## Test Accounts

After running the database setup, you can log in with these accounts:

- **Admin**: admin@school.com / password123
- **Teacher**: john.teacher@school.com / password123
- **Student**: alice.student@school.com / password123

## Database Schema

The system includes these main tables:
- `users` - All system users with roles
- `classes` - Grade levels and class organization
- `subjects` - Subjects per class
- `students` - Student-specific data and class assignments
- `teachers` - Teacher-specific data and subject assignments
- `assignments` - Assignment details and deadlines
- `questions` - Individual questions for assignments
- `submissions` - Student assignment submissions
- `marks` - Individual question scores

## Usage

### Admin Dashboard
- Manage users (create, edit, delete)
- Create and assign classes and subjects
- Create assignments for specific classes and subjects
- View all submissions and performance data
- Manage email whitelist for access control

### Teacher Dashboard
- View assigned classes and subjects
- See student lists for assigned classes
- Review and grade student submissions
- View class performance metrics
- Auto-graded MCQ results available immediately

### Student Dashboard
- Select subjects from assigned class
- View and complete assignments per subject
- Submit MCQ and written assignments
- Track personal performance and scores
- View submission history

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or check Services (Windows)
2. Verify connection: `psql -U postgres -h localhost`
3. Check if database exists: `psql -U school_user -d school_portal -h localhost`

### Common Setup Problems
- **Permission denied**: Make sure the `school_user` has proper database permissions
- **Port conflicts**: Change the PORT in `.env` if 5000 is already in use
- **Module not found**: Run `npm install` to ensure all dependencies are installed

### Reset Database
To start fresh, you can drop and recreate the database:
```sql
DROP DATABASE IF EXISTS school_portal;
DROP USER IF EXISTS school_user;
```
Then run `node setup-database.js` again.

## Development

The project uses:
- **Concurrently** to run frontend and backend simultaneously
- **Nodemon** for backend auto-restart on changes
- **Vite** for fast frontend development
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Production Deployment

1. Update environment variables for production
2. Change JWT_SECRET to a secure random string
3. Configure PostgreSQL for production use
4. Build the frontend: `npm run build`
5. Use a process manager like PM2 for the backend

## License

This project is for educational purposes.