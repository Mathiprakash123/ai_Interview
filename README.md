# AI Interview Coach

## Overview

**AI Interview Coach** is an AI-powered interview preparation app that helps users practice job interviews through simulated sessions. Users can sign up or log in, select interview types (behavioral or technical), and interact with AI-generated questions powered by Gemini GenKit AI. The app records and analyzes voice responses, provides real-time feedback, and helps users track their progress.

---

## Features

### 1. User Authentication
- Secure user signup and login using **Firebase Authentication**.
- Session management and user validation through Firebase.

### 2. Interview Type Selection
- Choose between **Behavioral** or **Technical** interview simulations.
- Questions dynamically generated using **Gemini GenKit AI** based on selected type.

### 3. Voice Interaction & Analysis
- Records user’s voice responses during the interview.
- AI transcribes and analyzes the response for tone, clarity, confidence, and content relevance.
- Provides instant, personalized feedback.

### 4. Interview Navigation
- Two main control buttons:
  - **Next Question**: Proceed to the next AI-generated question.
  - **End Session**: Finish the interview session and view summary.

### 5. History & Progress Tracking
- Stores interview sessions in **Firebase Firestore**.
- Users can view past sessions and feedback for review and improvement.

### 6. Logout
- Secure logout option to protect user data.

### 7. Data Storage & Security
- All user data, session history, and feedback securely stored and managed in Firebase.
- Authentication and authorization handled via Firebase to ensure user privacy.

---

## How It Works

1. **Signup/Login:** Users create an account or log in via Firebase Authentication.  
2. **Select Interview Type:** User picks behavioral or technical interview type.  
3. **Question Generation:** Gemini GenKit AI generates questions dynamically.  
4. **Answer via Voice:** User answers by speaking; the app records and transcribes the response.  
5. **Feedback:** AI analyzes the answer and instantly provides feedback.  
6. **Next or End:** User chooses to move to the next question or end the session.  
7. **Session History:** All sessions and feedback are saved and accessible anytime.  
8. **Logout:** Users can log out securely from their account.

---

## Technologies Used

- **Firebase Authentication & Firestore** – User management and data storage.  
- **Gemini GenKit AI** – AI-powered question generation and voice response analysis.  
- **Speech-to-Text** – Real-time transcription of voice responses.  

---

## Getting Started

### Installation
- Clone the repository.  
- Set up Firebase project and configure Firebase Authentication & Firestore.  
- Obtain API access to Gemini GenKit AI.  
- Install dependencies and run the app on your preferred platform.

### Usage
- Sign up or log in.  
- Select interview type (Behavioral or Technical).  
- Respond to AI-generated questions via voice.  
- Review AI feedback after each answer.  
- Use **Next Question** or **End Session** buttons.  
- Access your past sessions in the **History** tab.  
- Log out securely when done.

---

## Contributing

Contributions and feedback are welcome! Please open issues or pull requests.

---

## Contact

For support, please reach out at: mathiprakashofficial@gmail.com
