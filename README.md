# 🐾 PetAgent - Your Pet's Digital Health Companion

<div align="center">

![PetAgent Logo](public/images/icon-512.png)

**A Progressive Web App for managing your pet's health, medical records, and nutrition**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://www.sqlite.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple.svg)](https://web.dev/progressive-web-apps/)

</div>

## 📖 About

PetAgent is a comprehensive web application designed to help pet owners keep track of their pets' important information in one centralized, easy-to-access location. Whether you need to quickly reference your pet's medical history during a vet visit or track their dietary habits, PetAgent has you covered.

### Why PetAgent?

- **Emergency Ready**: Instant access to critical pet information when you need it most
- **Health Tracking**: Maintain a complete medical history with document uploads
- **Nutrition Monitoring**: Log and track your pet's feeding schedule and dietary needs
- **Multi-Pet Support**: Manage multiple pets from a single account
- **Offline Access**: Works offline as a Progressive Web App (PWA)
- **Privacy First**: Your data stays on your device with local SQLite storage

## ✨ Features

### 🏥 Medical Records Management

- Upload and store medical documents (PDFs, images, videos)
- Track veterinarian visits with dates and notes
- Quick search and retrieval of medical history
- Attach doctor names and detailed information to each record

### 🍖 Food Log Tracking

- Record feeding times and food types
- Track quantities and special dietary notes
- Monitor eating patterns over time
- Perfect for pets with special dietary requirements

### 👤 User Profile Management

- Secure authentication system
- Customizable user profiles with avatars
- Password management
- Multi-user support

### 🐕 Pet Information

- Store essential pet details (name, breed, blood type, DNI)
- Custom categories for different pet types
- Photo uploads for each pet
- Edit and update pet information anytime

### 🎨 Modern UI/UX

- **Dark Mode**: Automatic system theme detection with manual toggle
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Theme Options**: Light, Dark, and Auto (system) modes
- **Material Icons**: Clean, modern interface
- **Glassmorphism**: Beautiful, contemporary design elements

### 📱 Progressive Web App

- Install on any device (mobile/desktop)
- Offline capability for cached content
- Fast loading times
- Native app-like experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/PetAgent.git
cd PetAgent
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the application**

```bash
npm start
```

4. **Access the app**
   Open your browser and navigate to:

```
http://localhost:3000
```

### First Time Setup

1. Register a new account
2. Add your first pet with basic information
3. Start uploading medical documents or logging food entries
4. Customize your theme preference in the footer

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Sequelize** - ORM for database management
- **SQLite** - Lightweight database
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **express-session** - Session management

### Frontend

- **EJS** - Templating engine
- **Vanilla CSS** - Custom styling with CSS variables
- **Vanilla JavaScript** - Client-side functionality
- **Material Icons** - Icon library

### PWA Features

- Service Worker for offline caching
- Web App Manifest for installability
- Responsive design with mobile-first approach

## 📁 Project Structure

```
PetAgent/
├── database/           # SQLite database files
├── middleware/         # Custom middleware (upload, auth)
├── models/            # Sequelize models
│   ├── User.js
│   ├── Pet.js
│   ├── Category.js
│   ├── MedicalDoc.js
│   └── FoodLog.js
├── public/            # Static assets
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side scripts
│   ├── images/       # App icons and images
│   └── uploads/      # User uploaded files
├── routes/            # Express routes
│   ├── auth.js
│   ├── pets.js
│   └── profile.js
├── views/             # EJS templates
│   ├── auth/
│   ├── pets/
│   ├── user/
│   └── partials/
├── app.js             # Main application file
└── package.json       # Dependencies and scripts
```

## 🎨 Theme System

PetAgent features a sophisticated theme system with three modes:

- **☀️ Light Mode**: Clean, bright interface
- **🌙 Dark Mode**: Easy on the eyes for low-light environments
- **🔆 Auto Mode**: Automatically follows your system theme preference

Theme preferences are saved in browser localStorage and persist across sessions.

## 📸 Screenshots

### Dashboard

Manage all your pets from a centralized dashboard with quick access to their profiles.

### Pet Details

View comprehensive pet information including medical records and food logs.

### Dark Mode

Seamless dark mode support for comfortable viewing in any lighting condition.

## 🔒 Security

- Passwords are hashed using bcrypt
- Session-based authentication
- File upload validation and sanitization
- SQL injection protection via Sequelize ORM

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Material Icons by Google
- Express.js community
- All pet owners who inspired this project

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Contact: your.email@example.com

---

<div align="center">

**Made with ❤️ for pet lovers everywhere**

⭐ Star this repo if you find it helpful!

</div>
