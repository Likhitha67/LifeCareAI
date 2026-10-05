# LifeCare AI 🩺

**AI-powered personal health and document assistant built with React, TypeScript, and Google Gemini AI.**

LifeCare AI is a web application designed to help users organize important health-related documents, extract text from images using OCR, identify medicines from packaging, manage medicine reminders, track document expiry dates, and get general health information through an AI assistant.

> **Disclaimer:** LifeCare AI is an informational and organizational tool. It does not provide medical diagnosis, prescribe medicines, or replace a qualified healthcare professional.

---

## ✨ Features

### 📊 Personal Health Dashboard

* Overview of saved documents and medicines
* Medicine reminders and due-today information
* Upcoming document expiry information
* Recent document activity
* Quick access to major application features

### 📁 Smart Document Vault

* Upload and organize personal documents
* Store document metadata
* View document details
* Track document expiry dates
* Access recently added documents

### 🔎 OCR Document Reader

* Extract text from document images using Tesseract OCR
* Image preprocessing for improved OCR quality
* Automatic document-type detection
* Word and character count
* OCR processing-time tracking
* Original-image and processed-image comparison
* OCR scan history

### 💊 Medicine Strip Scanner

* Scan medicine packaging or strips
* Detect possible medicine names from extracted text
* Detect dosage information when available
* Supports common medicine names and aliases
* Provides confidence information
* Includes verification guidance before relying on extracted information

### 🤖 AI Health Assistant

* Powered by Google Gemini AI
* Explains general health terminology
* Helps summarize uploaded document information
* Provides general medicine information
* Uses document context when available
* Includes safety-focused responses
* Local fallback responses are available when the AI service is unavailable

### ⏰ Medicine Reminders

* Store medicines and dosage information
* Track medicine schedules
* View medicines due today
* Organize medicine information

### 📅 Document Expiry Reminder

* Track expiry dates for important documents
* Identify expired documents
* Highlight documents approaching expiry

### 👤 Profile & Settings

* User profile management
* Application preferences
* Theme support
* Authentication-related screens

---

## 🛠️ Tech Stack

| Technology        | Purpose                               |
| ----------------- | ------------------------------------- |
| React             | User interface                        |
| TypeScript        | Application development               |
| Vite              | Development and production build tool |
| Tailwind CSS      | Styling                               |
| Lucide React      | UI icons                              |
| Tesseract.js      | OCR and text extraction               |
| Google Gemini API | AI assistant                          |
| Motion            | UI animations                         |
| Canvas Confetti   | UI feedback effects                   |
| Local Storage     | Local application persistence         |

---

## 🔄 How the OCR Pipeline Works

```text
Document / Image
       ↓
Image Preprocessing
       ↓
Tesseract OCR
       ↓
Text Normalization
       ↓
Document Type Detection
       ↓
Quality Evaluation
       ↓
Extracted Text + OCR Statistics
       ↓
Saved OCR Scan
```

The OCR system first evaluates the original image. If the extracted result is not good enough, an optional processed version of the image can be evaluated and compared to the original result.

---

## 💊 How the Medicine Scanner Works

```text
Medicine Image
      ↓
OCR Text Extraction
      ↓
Text Normalization
      ↓
Medicine Name / Alias Matching
      ↓
Dosage Detection
      ↓
Confidence Evaluation
      ↓
Possible Medicine Result
```

The scanner uses a medicine knowledge list containing common generic names and aliases. It also uses pattern matching to identify dosage information such as `500 mg`, `650 mg`, `60,000 IU`, and similar formats.

**Important:** Image-based medicine recognition is treated as a possible match, not a definitive identification. Users should verify the medicine and dosage from the original packaging or with a pharmacist/healthcare professional.

---

## 🤖 AI Assistant

LifeCare AI integrates Google Gemini for general health-information assistance.

The assistant is designed to:

* Explain health terminology in simple language
* Summarize non-sensitive document information
* Explain general medicine information
* Use uploaded document context when relevant
* Distinguish extracted document information from explanations
* Avoid inventing missing or unreadable information
* Provide safety guidance for emergency situations

The application does **not** use the AI assistant as a diagnostic or prescribing system.

---

## 🧠 Project Structure

```text
LifeCareAI/
│
├── public/
│   ├── logo.png
│   └── logo.svg
│
├── src/
│   ├── components/
│   │   ├── assistant/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── medicines/
│   │   ├── ocr/
│   │   └── scanner/
│   │
│   ├── context/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── authService.ts
│   │   ├── dbService.ts
│   │   ├── medicineScanner.ts
│   │   ├── ocrService.ts
│   │   └── storage.ts
│   │
│   ├── types/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Run Locally

### Prerequisites

Make sure you have:

* Node.js
* npm
* A Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Likhitha67/LifeCareAI.git
cd LifeCareAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Create a `.env` file in the project root.

Use:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Do **not** commit your real API key to GitHub.

The repository includes `.env.example` as a safe template.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

---

## 🏗️ Production Build

To create a production build:

```bash
npm run build
```

The generated production files are placed in:

```text
dist/
```

---

## 🔐 Environment Variables

| Variable              | Description                                    |
| --------------------- | ---------------------------------------------- |
| `VITE_GEMINI_API_KEY` | Google Gemini API key used by the AI assistant |

The real `.env` file is excluded from Git using `.gitignore`.

**Never expose or commit a real API key in a public repository.**

---

## 📱 Responsive Design

LifeCare AI is designed to work across:

* Desktop
* Tablet
* Mobile

The application UI has been tested using responsive browser layouts.

---

## 🔮 Future Improvements

Potential future improvements include:

* Secure backend API proxy for Gemini requests
* Cloud database integration
* Secure user authentication
* Cloud document storage
* More advanced medicine recognition
* Barcode-based medicine lookup
* Improved OCR for difficult document images
* Notification integration
* More document categories
* Advanced health-document analytics
* Deployment with production-grade security

---

## 📌 Project Status

**Status: Active Development**

The current version includes the core dashboard, document management, OCR processing, medicine scanning, reminders, and Gemini-powered assistant functionality.

---

## 👩‍💻 Author

**Likhitha Konda**

B.Tech Computer Science — Artificial Intelligence & Data Science

* GitHub: [@Likhitha67](https://github.com/Likhitha67)

---

## ⚠️ Medical Disclaimer

LifeCare AI is created for educational, informational, and personal organization purposes.

It should not be used to:

* Diagnose medical conditions
* Prescribe medicines
* Change medication dosage
* Start or stop medication
* Replace professional medical advice

For medical concerns, consult a qualified healthcare professional. For emergency symptoms, seek immediate medical assistance.
