# Smriti 🧠

### AI-Assisted Memory & Care Support Platform for Elderly People

Smriti is an MVP mobile application designed to support elderly people, particularly those experiencing memory-related difficulties, while helping caregivers monitor, manage, and personalize their daily care.

The project was developed as a **hackathon MVP** to demonstrate the core product concept, user flows, and technical architecture. The current version focuses on establishing the foundation for patient care, caregiver monitoring, cognitive activities, reminders, and adaptive support.

---

## 🎯 Problem

Memory-related difficulties in elderly people can affect their ability to:

- Remember daily activities and important tasks
- Follow medication and routine schedules
- Stay connected with family and caregivers
- Maintain consistency in cognitive activities
- Communicate important personal information when assistance is required

At the same time, caregivers may lack a simple way to:

- Monitor a patient's activity and progress
- Understand changes in performance
- Manage reminders and daily routines
- Keep important patient and family information accessible
- Provide personalized support based on the patient's activity

### The Gap

Existing solutions often focus on individual features such as reminders, health monitoring, or cognitive exercises.

**Smriti aims to bring these support mechanisms together into one simple, caregiver-connected platform.**

---

## 💡 Solution

Smriti provides two primary experiences:

### 👴 Patient

Designed with simplicity and accessibility in mind.

Core features include:

- Simple patient interface
- Cognitive games and activities
- Performance and score tracking
- Daily reminders
- Patient identification information
- Family information
- Personalized difficulty/support

### 👩‍⚕️ Caregiver

A dedicated interface for caregivers to manage and monitor patients.

Core features include:

- Patient management
- Patient profile
- Patient identification card
- Family and emergency information
- Activity and performance analysis
- Reminders and daily planning
- Voice-based reminder support
- Care recommendations and advisory

---

## 🧠 Adaptive Support

One of the key ideas behind Smriti is that support should not remain static.

The platform can use patient activity patterns such as:

- Game accuracy
- Scores
- Attempts
- Response time
- Consistency

to help adjust the difficulty and provide more personalized support.

The current MVP demonstrates the foundation for this adaptive layer, which can be expanded with more advanced AI models and behavioral analysis.

---

## 🏗️ Technology Stack

### Mobile Application
- **Expo**
- **React Native**
- **TypeScript**

### Backend
- **Python**
- **FastAPI**
- **REST APIs**

### Database
- **PostgreSQL**

### Authentication & Local Storage
- **JWT Authentication**
- **Expo SecureStore**
- **AsyncStorage** for local caching

### Voice & Notifications
- **Expo Audio**
- **Expo Notifications**
- Voice-based reminders for future/extended implementation

---

## 🔄 System Architecture

```text
┌──────────────────────────────┐
│       Expo React Native      │
│        + TypeScript          │
│                              │
│  Patient App | Caregiver App │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│                              │
│ Authentication               │
│ Patient Management           │
│ Game Sessions                │
│ Reminders                    │
│ Caregiver Features           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│                              │
│ Users | Patients             │
│ Sessions | Reminders         │
│ Voice Metadata | Family Data │
└──────────────────────────────┘
```

## 🚀 Current MVP

The current Smriti MVP focuses on demonstrating the core patient and caregiver workflow.

### Patient Side

- Simple, accessible patient interface
- Cognitive games and activities
- Game score and performance tracking
- Daily reminders
- Patient profile and identification information
- Family information
- Adaptive difficulty foundation based on game performance

### Caregiver Side

- Caregiver dashboard
- Patient management
- Patient profile
- Patient activity and performance analysis
- Patient identification information
- Family and emergency information
- Reminders and daily planning
- Foundation for caregiver recommendations/advisory

### Technical MVP

- Expo + React Native mobile application
- TypeScript frontend
- FastAPI REST backend
- PostgreSQL database
- Patient and caregiver data models
- Authentication foundation using JWT
- API-based communication between mobile application and backend
- Game-session data storage and analysis foundation

> **Note:** This is a hackathon MVP focused on validating the core concept and demonstrating the application's technical foundation. Some advanced features are planned for future development.

---

## 🔮 Future Scope

The Smriti platform can be expanded beyond the current MVP with:

### 🔐 Authentication & Security

- Patient login using email OTP
- Persistent login sessions
- Role-based access control
- Improved authentication and security mechanisms

### 🧠 AI & Personalization

- Advanced AI-based behavioral analysis
- Personalized cognitive exercises
- Dynamic difficulty adjustment
- Long-term performance and behavioral trend analysis
- AI-assisted caregiver advisory

### 🔊 Voice & Smart Reminders

- Caregiver-recorded voice reminders
- Voice-based medication reminders
- Scheduled voice instructions
- Speech-to-text using Whisper
- Multi-language voice interaction
- Text-to-speech support

### 📅 Daily Care & Execution Planning

- Calendar-style daily execution plan
- Scheduled activities and tasks
- Medication, meal, exercise, and activity reminders
- Automated routine management

### 🛡️ Safety & Emergency Support

- Location-based safety features
- Lost-patient identification support
- Emergency contact system
- Patient ID card with essential information
- Safety alerts for caregivers and family members

### 🌐 Scalability

- Offline-first functionality
- Cloud-based voice storage
- Multi-patient caregiver management
- NGO and healthcare organization support
- Advanced analytics dashboard
- Expansion to additional Indian languages

---

## 👥 Target Users

### 👴 Elderly People

Especially elderly users experiencing:

- Memory-related difficulties
- Difficulty maintaining daily routines
- Difficulty remembering medication or activities
- Need for simple and accessible digital interaction

### 👨‍👩‍👧 Family Caregivers

Family members who need to:

- Monitor a loved one's activities
- Manage reminders
- Access important patient information
- Stay connected with the patient's daily routine
- Respond quickly during emergencies

### 👩‍⚕️ Professional Caregivers

Caregivers, nursing staff, and support workers who manage one or more elderly patients and require:

- Patient profiles
- Activity monitoring
- Performance analysis
- Daily execution planning
- Reminder management

### 🏢 NGOs & Elderly-Care Organizations

Organizations supporting elderly populations that could use Smriti for:

- Managing multiple patients
- Monitoring activities
- Maintaining patient information
- Coordinating caregivers
- Improving continuity of care

### 🏥 Healthcare & Support Institutions

Potential future users such as:

- Elder-care facilities
- Assisted-living organizations
- Community healthcare programs
- Memory-care support centers

> **Primary MVP users:** Elderly people and their family/caregivers.