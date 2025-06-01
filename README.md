# Smart Home Application

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-lightgrey)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Demo Video

[![Smart Home Application Demo](https://img.shields.io/badge/YouTube-Demo%20Video-red)](https://youtu.be/EHklUPJBXFI)

Watch our demo video to see the Smart Home Application in action!

## Overview

A modern smart home application that integrates multiple intelligent features to enhance home automation and security. The application provides a seamless user experience through various smart features including FaceID authentication, Voice Control capabilities, and real-time environmental monitoring.

### Key Features

- **FaceID Authentication**: Secure and convenient biometric authentication
- **Voice Control**: Hands-free operation for:
  - Fan control
  - Light control
- **Environmental Monitoring**:
  - Real-time temperature tracking
  - Humidity level monitoring

## Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Backend Setup

#### Prerequisites
- MongoDB installation required based on your operating system:
  - [Windows Installation Guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
  - [Linux Installation Guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/)
  - [MacOS Installation Guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)

#### Environment Setup
Create a `.env` file in the `backend` directory with the following configuration:

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Adafruit IO Configuration
ADAFRUIT_IO_USERNAME=your_adafruit_username
ADAFRUIT_IO_KEY=your_adafruit_key
```

> **Note**: Replace the placeholder values with your actual credentials. Do not commit the `.env` file to version control.

#### Running the Backend
From the parent workspace:
```bash
cd backend
uvicorn src.__innit__:app --reload
```

For AI modules backend:
```bash
cd ai/faceid
uvicorn main:app --reload port 5000
```

## Tech Stack

- **Frontend**:
  - React.js
  - Modern UI/UX design
  - Responsive layout

- **Backend**:
  - FastAPI
  - MongoDB
  - Python 3.8+

## Project Structure

```
├── frontend/          # React frontend application
├── backend/          # FastAPI backend server
│   └── src/         # Source code
└── README.md        # Project documentation
```
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

---
Made by HCMUT Students

