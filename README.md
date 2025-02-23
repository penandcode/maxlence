# MERN Stack Application

This is a MERN stack application that includes user authentication, admin functionality, and data management.

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v14 or higher)
* **npm** (v6 or higher)
* **mySQL**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/penandcode/maxlence
cd maxlence
```

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend

Create a `.env` file in the **backend** directory with the following content:

```env
PORT=5000
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
FRONTEND_URL=http://localhost:3000
```

#### Frontend

Create a `.env` file in the **frontend** directory with the following content:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Start the Application

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd ../frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to [http://localhost:3000](http://localhost:3000/) to access the application.

## Features

* User authentication (login, register, forgot password)
* Admin dashboard
* User management
* Data management
* Token-based authentication
* Role-based access control

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeatureName`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeatureName`)
5. Open a pull request

### You can contact with me here: **[rajputlakshit0@gmail.com](mailto:rajputlakshit0@gmail.com)**
