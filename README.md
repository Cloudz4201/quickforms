# Formly - Modern Form Builder

A modern, user-friendly form builder application built with React and Firebase. Create, manage, and analyze form responses with ease.

## Features

- 📝 Drag-and-drop form builder
- 📊 Real-time response analytics
- 🔍 Advanced response filtering
- 📱 Responsive design
- 🔐 Secure authentication
- 📁 File upload support
- 📈 Response visualization
- 🎨 Modern UI/UX

## Tech Stack

- React
- Firebase (Authentication, Firestore, Storage)
- Material-UI
- Redux Toolkit
- React Router
- Day.js
- React Beautiful DnD

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/formly.git
cd formly
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a Firebase project and add your configuration:
   - Go to Firebase Console
   - Create a new project
   - Enable Authentication (Email/Password, Google, GitHub)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config

4. Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
src/
├── components/      # Reusable components
├── contexts/        # Context providers
├── features/        # Redux slices and features
├── pages/          # Page components
├── config/         # Configuration files
├── constants/      # Constants and enums
└── utils/          # Utility functions
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/)
- [Material-UI](https://mui.com/)
- [Firebase](https://firebase.google.com/)
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
