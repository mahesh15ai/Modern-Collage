# Modern College of Computer Science & Information Technology, Nanded
## Smart Campus — Integrated ERP, Mobile PWA & AI Research System

> **Official Motto:** *Learn • Grow • Innovate*  
> **Affiliation:** Swami Ramanand Teerth Marathwada University (SRTMUN), Nanded  
> **Accreditation:** NAAC 'A' Grade Accredited  

---

## 🎯 Project Overview

This project is an enterprise-grade College Management and Student Lifecycle System built to modern specifications. It replicates the **Smart Campus** mobile experience (as specified in the institutional design mockups) alongside an administrative **Desktop Web ERP Portal**.

---

## 🏗️ Final Technology Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & UI:** Tailwind CSS + Lucide Icons + Custom Collegiate Crest SVG
- **Backend Services:** Firebase
- **Database:** Cloud Firestore (Scalable NoSQL schema with mock fallback mode)
- **Authentication:** Firebase Auth (Email/Password, Google OAuth, Role-based RBAC)
- **File Storage:** Firebase Storage (Marksheets, notes, student documents)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Mobile Experience:** Progressive Web App (PWA) with `manifest.json`, Service Worker caching, and installable mobile web app support
- **Future Research Track:** Python 3 + Scikit-Learn (`ml-research/` directory) for academic performance prediction and attendance risk classification

---

## 📱 Modules Included (13 Core Modules + Grievance & AI Lab)

| No. | Module Name | Features & Implementation Details |
|---|---|---|
| **1** | **Admin Dashboard** | College overview, total student/faculty counts, departmental breakdowns, average attendance, fee collection ratios, and instant analytics. |
| **2** | **Student Management** | Admission records, student profiles, PRN & roll numbers, academic batch details, and verified documents tracking. |
| **3** | **Faculty Management** | Faculty profiles, designations (HOD, Professor, Assistant Professor), department assignments, weekly workload hours, and subject allocations. |
| **4** | **Department & Course** | Academic tree: Computer Science, IT, Computer Applications, Data Science & AI; Course durations, semesters, syllabus, and credit matrices. |
| **5** | **Attendance Management** | Overall attendance donut gauge (92%), Present (46), Absent (4), Late (1) counters, monthly trend histograms (Aug–Nov), and subject-wise breakdown. |
| **6** | **Examination Management** | Semester examination timetable, room/hall assignments, maximum marks, hall ticket generation, and continuous internal evaluations. |
| **7** | **Result Management** | Semester grade cards, overall percentage trophy badge (78.5%), subject-wise marks breakdown, CGPA, and one-click PDF marksheet generator. |
| **8** | **Timetable Management** | Class-wise & Subject-wise timetable toggles, day-wise filter tabs (Mon–Fri), lecture/lab slots, room allocations (Lab 1, B-204), and faculty tags. |
| **9** | **Assignment Management** | Homework, coding assignments, due dates, submission status, grading, and rubric details. |
| **10** | **Study Materials** | Digital repository: Notes, previous year question papers, reference books, category filters, and direct download links. |
| **11** | **Fees Management** | Fee breakdown, pending fees (₹2,500), payment history (Sem 4 & Sem 5 ₹10,000 paid), online payment simulation, and official e-receipt modal. |
| **12** | **Notice Board** | Broadcast notifications with priority category badges (*Academic*, *Exam*, *Urgent*, *General*), and pinned circulars. |
| **13** | **Events & Activities** | Technical and cultural symposiums, featuring **Tech Fest 2025** (*Code • Create • Innovate*, 25 May 2025), Cultural Event, and live registration counts. |
| **+** | **Grievance Redressal** | Interactive student complaint ticketing (*Wi-Fi not working*, *Projector maintenance*, *Water cooler*), status tracking, and new ticket filing. |
| **+** | **AI Research Lab** | Interactive Scikit-Learn prediction sandbox simulating the research model directly within the ERP interface. |

---

## 📁 Repository Directory Structure

```text
ModernClg/
├── public/
│   ├── manifest.json                  # PWA Web App Manifest
│   ├── sw.js                          # Service Worker for offline PWA
│   └── favicon.ico                    # Favicon
├── src/
│   ├── app/
│   │   ├── globals.css                # Tailwind styling
│   │   ├── layout.tsx                 # Root layout with PWA meta & AppProvider
│   │   └── page.tsx                   # Dual-view controller (Mobile PWA & Desktop ERP)
│   ├── components/
│   │   ├── common/
│   │   │   └── CollegeLogo.tsx        # Modern College crest & laurel SVG
│   │   ├── mobile/
│   │   │   ├── MobileFrame.tsx        # Realistic phone bezel with Dynamic Island
│   │   │   ├── SplashScreen.tsx       # Screen 1: College Splash
│   │   │   ├── LoginScreen.tsx        # Screen 2: Role Switcher Login
│   │   │   ├── StudentDashboard.tsx   # Screen 3: Student Overview
│   │   │   ├── AttendanceView.tsx     # Screen 4: Donut & Monthly Trend
│   │   │   ├── ResultsView.tsx        # Screen 5: Trophy & Subject Marks
│   │   │   ├── TimetableView.tsx      # Screen 6: Schedule & Rooms
│   │   │   ├── StudyMaterialsView.tsx # Screen 7: PDF Notes & Papers
│   │   │   ├── FeesView.tsx           # Screen 8: Fees & Receipts
│   │   │   ├── ComplaintsView.tsx     # Screen 9: Grievance Tickets
│   │   │   ├── EventsView.tsx         # Screen 10: Tech Fest 2025
│   │   │   ├── NoticesView.tsx        # Circulars & Alerts
│   │   │   └── ProfileView.tsx        # Student ID & Verified Docs
│   │   └── admin/
│   │       └── AdminPortal.tsx        # Comprehensive 13-Module ERP Dashboard
│   ├── context/
│   │   └── AppContext.tsx             # Shared state & interactive actions
│   ├── lib/
│   │   ├── firebase.ts                # Firebase SDK init with safe fallback
│   │   └── mockData.ts                # Realistically seeded institutional data
│   └── types/
│       └── index.ts                   # Complete TypeScript data contracts
├── ml-research/
│   ├── requirements.txt               # Scikit-learn, Pandas, NumPy, Joblib
│   ├── dataset_generator.py           # Simulates 2,000 student academic records
│   ├── student_performance_predictor.py # RandomForest & GradientBoosting models
│   ├── attendance_risk_classifier.py  # Logistic Regression early warning classifier
│   ├── api_bridge.py                  # CLI & JSON API inference runner
│   └── README.md                      # Research methodology & documentation
├── .env.example                       # Firebase environment variables template
├── next.config.mjs                    # Next.js build & PWA configuration
├── tailwind.config.ts                 # Tailwind configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Run the Next.js Frontend & Mobile PWA

```bash
# Install dependencies (already completed)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
- **Top bar controls:** Switch between the **Mobile PWA View** (matches the 10 smartphone screens in the mockup) and the **Desktop ERP Portal**.
- You can click on any of the 10 screen buttons to immediately jump to that screen, or click interactive elements inside the phone to navigate naturally.

### 2. Run the Machine Learning Research Module

```bash
# Navigate to research directory
cd ml-research

# Install Python requirements
pip install -r requirements.txt

# Generate synthetic dataset (2,000 student samples)
python dataset_generator.py

# Train the Scikit-learn predictor
python student_performance_predictor.py

# Run prediction for a student via CLI
python api_bridge.py --attendance 92.0 --cgpa 8.35 --assignment 95.0
```

### 3. Connect Production Firebase (Optional)

The application includes an automatic mock fallback mode so it runs immediately out-of-the-box without needing any setup. When ready to connect your production Firebase project:
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase Console project keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=modern-college-nanded.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=modern-college-nanded
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=modern-college-nanded.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
