# 💼 Jobify — Job Portal with Smart Features

Jobify is a full-stack job portal built to connect job seekers with employers in a simple and efficient way.  
It allows users to browse jobs, save them, apply easily, and even get AI-generated summaries of job descriptions.



---

## 🚀 Features

### 👤 Authentication & Roles
- Secure login & signup using JWT
- Role-based access:
  - Job Seeker
  - Employer

---

### 💼 Job Management
- Employers can:
  - Post jobs
  - Update jobs
  - Delete jobs
- Job seekers can:
  - Browse jobs
  - View detailed job descriptions

---

### 🔍 Search & Filters
- Search jobs by:
  - Title
  - Company
- Filter by:
  - Category
  - Experience level
  - Location
  - Salary
  - Skills

---

### ⭐ Save / Unsave Jobs
- Save jobs for later
- View all saved jobs in profile
- Toggle save/unsave instantly

---

### 📄 Resume Handling
- Upload resume once
- Automatically used while applying to jobs

---

### 🤖 AI Job Summarizer
- Generates a clean and short summary of job descriptions
- Helps users quickly understand:
  - Responsibilities
  - Required skills
  - Experience

---

### ⏳ Job Expiry System
- Jobs expire automatically after a set duration
- Cron job runs daily to:
  - Mark expired jobs
  - Send reminders for expiring jobs

---

### 📧 Email Notifications
- Email alerts for:
  - Jobs about to expire

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Other Tools
- JWT (Authentication)
- Node Cron (Scheduled jobs)
- AI Job  summariser
- Nodemailer (Emails)

---



## ⚙️ Installation & Setup

```bash
git clone https://github.com/your-username/Job-Connect.git
cd jobify

cd backend
npm install
node server.js

cd frontend
npm install
npm run dev


