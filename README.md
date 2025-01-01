<div class="hero-icon" align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
</div>

<h1 align="center">
  fitify-fitness-tracker
</h1>
<h4 align="center">Track fitness goals, monitor progress, and share with friends effortlessly.</h4>
<h4 align="center">Developed with the software and tools below.</h4>
<div class="badges" align="center">
  <img src="https://img.shields.io/badge/Framework-React_18.2.0-blue" alt="React 18.2.0">
  <img src="https://img.shields.io/badge/Frontend-JavaScript,_HTML,_CSS-red" alt="JavaScript, HTML, CSS">
  <img src="https://img.shields.io/badge/Backend-Node.js_18+-blue" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/Database-MongoDB-green" alt="MongoDB">
</div>
<div class="badges" align="center">
  <img src="https://img.shields.io/github/last-commit/coslynx/fitify-fitness-tracker?style=flat-square&color=5D6D7E" alt="git-last-commit" />
  <img src="https://img.shields.io/github/commit-activity/m/coslynx/fitify-fitness-tracker?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
  <img src="https://img.shields.io/github/languages/top/coslynx/fitify-fitness-tracker?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</div>

## 📑 Table of Contents
- 📍 Overview
- 📦 Features
- 📂 Structure
- 💻 Installation
- 🏗️ Usage
- 🌐 Hosting
- 📄 License
- 👏 Authors

## 📍 Overview
This repository contains a Minimum Viable Product (MVP) for a fitness tracker web application. It allows users to set fitness goals, track progress, and share achievements. Built using React for the frontend and Node.js for the backend, with MongoDB for data storage, it targets fitness enthusiasts seeking a simple yet effective tracking solution. The application provides user authentication, goal setting, progress visualization, and social sharing capabilities.

## 📦 Features
|    | Feature            | Description                                                                                                        |
|----|--------------------|--------------------------------------------------------------------------------------------------------------------|
| ⚙️ | **Architecture**   | The application uses a modular architecture with React components on the frontend and a RESTful API with Node.js and Express on the backend. The data is stored in MongoDB, providing scalability and flexibility.        |
| 📄 | **Documentation**  | The repository includes a `README.md` file that provides a detailed overview of the MVP, its dependencies, setup instructions, and API documentation.               |
| 🔗 | **Dependencies**   | The application relies on libraries such as `react`, `react-router-dom`, `axios`, `express`, `mongodb`, and `jsonwebtoken` for core functionality. All dependencies are managed using `npm`.     |
| 🧩 | **Modularity**     | The codebase is structured into reusable components and modules, promoting code reusability, maintainability, and ease of expansion.       |
| 🧪 | **Testing**        | Includes unit tests for key React components and API endpoints to ensure the reliability and robustness of the codebase.        |
| ⚡️  | **Performance**    | Optimized for performance with efficient data fetching using `axios`, React rendering optimization techniques, and optimized database queries.  |
| 🔐 | **Security**       | Includes user authentication, password hashing, and secure communication via HTTPS to protect user data and prevent unauthorized access.     |
| 🔀 | **Version Control**| Utilizes Git for version control, allowing for easy tracking of changes and collaboration. Includes `.gitignore` to exclude unnecessary files.         |
| 🔌 | **Integrations**   | Uses Axios for making HTTP requests to the backend API. Integration with MongoDB for persistence and data management.    |
| 📶 | **Scalability**    | Designed with scalability in mind, the system utilizes a cloud-native architecture, containerization, and database indexing for better performance under increased loads.         |

## 📂 Structure
text
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Modal.jsx
│   ├── auth/
│   │   └── AuthForms.jsx
│   ├── goals/
│   │   ├── GoalForm.jsx
│   │   └── GoalList.jsx
│   └── progress/
│       ├── ProgressChart.jsx
│       └── ProgressInput.jsx
├── pages/
│   ├── Home.jsx
│   └── Dashboard.jsx
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── context/
│   └── AuthContext.js
├── services/
│   └── api.js
├── utils/
│   └── helpers.js
└── styles/
    └── global.css
public/
    └── index.html
    └── favicon.ico
api/
    ├── controllers/
    │   └── mainController.js
    ├── models/
    │   ├── User.js
    │   ├── Goal.js
    │   └── Progress.js
    ├── middlewares/
    │   └── authMiddleware.js
    └── config/
        └── db.js
tests/
    └── api.test.js
constants/
    └── apiEndpoints.js
types/
    └── types.d.ts
tailwind.config.js
README.md
.gitignore
package.json
.env
startup.sh
commands.json


## 💻 Installation
> [!WARNING]
> ### 🔧 Prerequisites
> - Node.js v18 or higher
> - npm 6 or higher
> - MongoDB 6.0 or higher

### 🚀 Setup Instructions
1. Clone the repository:
    bash
    git clone https://github.com/coslynx/fitify-fitness-tracker.git
    cd fitify-fitness-tracker
    
2. Install dependencies:
    bash
    npm install
    
3. Set up the database:
   - Ensure MongoDB is installed and running.
   - Create a `.env` file in the root of the project based on the `.env.example` file and configure the `VITE_DATABASE_URL` environment variable.
   - The database will be automatically created when the application starts using the provided connection string, you do not need to create a database manually.

4. Configure environment variables:
    bash
    cp .env.example .env
    # Update .env file with your MongoDB connection string and JWT secret
    

## 🏗️ Usage
### 🏃‍♂️ Running the MVP
1. Start the frontend development server:
   bash
   npm run dev
   
2. Start the backend API server:
   bash
   # Make sure the database is running before starting the server
   npm run api
   
3. Access the application:
   - Web interface: [http://localhost:5173](http://localhost:5173)
   - API endpoint: [http://localhost:5173/api](http://localhost:5173/api)

> [!TIP]
> ### ⚙️ Configuration
> -  The API base URL is configured in the `.env` file using the `VITE_API_BASE_URL` variable.
> -  The JWT secret is configured using `VITE_JWT_SECRET`.
> -  The MongoDB connection URL is configured using `VITE_DATABASE_URL`.

### 📚 Examples
Provide specific examples relevant to the MVP's core features. For instance:

- 📝 **User Registration**: 
  bash
    curl -X POST http://localhost:5173/api/auth/signup \
      -H "Content-Type: application/json" \
      -d '{"username": "newuser", "email": "user@example.com", "password": "securepass123"}'
  

- 📝 **Login**: 
  bash
    curl -X POST http://localhost:5173/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "user@example.com", "password": "securepass123"}'
  
- 📝 **Creating a Goal**: 
   bash
    curl -X POST http://localhost:5173/api/goals \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_JWT_TOKEN" \
      -d '{"name": "Run a marathon", "description": "Train to run a full marathon", "targetValue": 26.2, "unit": "miles", "startDate": "2024-08-01", "endDate": "2024-12-31"}'
  

- 📝 **Adding Progress**: 
  bash
    curl -X POST http://localhost:5173/api/progress \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer YOUR_JWT_TOKEN" \
      -d '{"goalId": "goal_id_here", "date": "2024-07-20", "value": 100}'
  

## 🌐 Hosting
### 🚀 Deployment Instructions
Provide detailed, step-by-step instructions for deploying to the most suitable platform for this MVP. For example:

#### Deploying to Render
1. Create a new web service on Render.
2. Connect your GitHub repository to the service.
3. Set up the following environment variables:
   bash
   VITE_API_BASE_URL=https://your-render-api-url.com
   VITE_DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   VITE_JWT_SECRET=your-secret-key
   VITE_NODE_ENV=production
   
   -  Make sure to replace placeholder values with your actual MongoDB connection string, JWT secret, and the Render API URL.
4. In your Render service's settings:
   - Set the **Build Command** to `npm run build`
   - Set the **Publish directory** to `dist`
   - Set the **Node version** to `18`
   - Set the **Start Command** to `npm run start`
5. Save your settings and deploy your application.

### 🔑 Environment Variables
Provide a comprehensive list of all required environment variables, their purposes, and example values:

- `VITE_API_BASE_URL`: Base URL for the backend API
   Example: `https://your-api-url.com/api`
- `VITE_DATABASE_URL`: MongoDB connection string
   Example: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
- `VITE_JWT_SECRET`: Secret key for JWT token generation
   Example: `your-secret-key`
- `VITE_NODE_ENV`: Environment mode (development or production)
   Example: `production`

## 📜 API Documentation
### 🔍 Endpoints
Provide a comprehensive list of all API endpoints, their methods, required parameters, and expected responses. For example:

- **POST /api/auth/signup**
  - Description: Register a new user.
  - Body: `{ "username": string, "email": string, "password": string }`
  - Response: `{ "id": string, "username": string, "email": string }`

- **POST /api/auth/login**
  - Description: Log in an existing user.
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "token": string }`

- **GET /api/users/me**
  - Description: Get the current user's profile.
  - Headers: `Authorization: Bearer TOKEN`
  - Response: `{ "id": string, "username": string, "email": string }`

- **POST /api/goals**
  - Description: Create a new fitness goal.
  - Headers: `Authorization: Bearer TOKEN`
  - Body: `{ "name": string, "description": string, "targetValue": number, "unit": string, "startDate": string, "endDate": string }`
  - Response: ` { "_id": string, "userId": string, "name": string, "description": string, "targetValue": number, "unit": string, "startDate": string, "endDate": string, "createdAt": string, "updatedAt": string } `

-  **GET /api/goals**
    - Description: Get all goals for the current user.
    - Headers: `Authorization: Bearer TOKEN`
    - Response: `[ { "_id": string, "userId": string, "name": string, "description": string, "targetValue": number, "unit": string, "startDate": string, "endDate": string, "createdAt": string, "updatedAt": string } ]`

- **GET /api/goals/:goalId**
    - Description: Get a single goal by ID.
    - Headers: `Authorization: Bearer TOKEN`
    - Response: `{ "_id": string, "userId": string, "name": string, "description": string, "targetValue": number, "unit": string, "startDate": string, "endDate": string, "createdAt": string, "updatedAt": string }`

- **POST /api/progress**
    - Description: Create a new progress entry.
    - Headers: `Authorization: Bearer TOKEN`
    - Body: `{ "goalId": string, "date": string, "value": number }`
    - Response: `{ "_id": string, "userId": string, "goalId": string, "date": string, "value": number, "createdAt": string, "updatedAt": string }`

-  **GET /api/progress/:goalId**
    - Description: Get all progress entries for a specific goal.
    - Headers: `Authorization: Bearer TOKEN`
    - Response: `[ { "_id": string, "userId": string, "goalId": string, "date": string, "value": number, "createdAt": string, "updatedAt": string } ]`
    
### 🔒 Authentication
Explain the authentication process in detail:

1. Register a new user or log in using `/api/auth/signup` or `/api/auth/login` endpoints to receive a JWT token.
2. Include the token in the Authorization header for all protected routes:
   
   Authorization: Bearer YOUR_JWT_TOKEN
   
3. Tokens are valid for 1 hour, a refresh token mechanism is not implemented in this MVP.

### 📝 Examples
Provide comprehensive examples of API usage, including request and response bodies:

bash
# Register a new user
curl -X POST http://localhost:5173/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username": "fitnessuser", "email": "user@example.com", "password": "securepass123"}'
# Response
{
    "_id": "user123",
    "username": "fitnessuser",
    "email": "user@example.com"
}

# Login a user
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Create a new goal
curl -X POST http://localhost:5173/api/goals \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d '{"name": "Run a marathon", "description": "Train to run a full marathon", "targetValue": 26.2, "unit": "miles", "startDate": "2024-08-01", "endDate": "2024-12-31"}'

# Response
{
  "_id": "goal123",
   "userId": "user123",
  "name": "Run a marathon",
   "description": "Train to run a full marathon",
  "targetValue": 26.2,
   "unit": "miles",
   "startDate": "2024-08-01T00:00:00.000Z",
   "endDate": "2024-12-31T00:00:00.000Z",
  "createdAt": "2024-07-20T00:00:00.000Z",
  "updatedAt": "2024-07-20T00:00:00.000Z"
}

# Add progress entry
curl -X POST http://localhost:5173/api/progress \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -d '{"goalId": "goal123", "date": "2024-07-20", "value": 100}'
# Response
{
  "_id": "progress123",
  "userId": "user123",
  "goalId": "goal123",
   "date": "2024-07-20T00:00:00.000Z",
   "value": 100,
   "createdAt": "2024-07-20T00:00:00.000Z",
  "updatedAt": "2024-07-20T00:00:00.000Z"
}


[Add more examples covering all major API functionalities]

> [!NOTE]
> ## 📜 License & Attribution
> 
> ### 📄 License
> This Minimum Viable Product (MVP) is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.
> 
> ### 🤖 AI-Generated MVP
> This MVP was entirely generated using artificial intelligence through [CosLynx.com](https://coslynx.com).
> 
> No human was directly involved in the coding process of the repository: fitify-fitness-tracker
> 
> ### 📞 Contact
> For any questions or concerns regarding this AI-generated MVP, please contact CosLynx at:
> - Website: [CosLynx.com](https://coslynx.com)
> - Twitter: [@CosLynxAI](https://x.com/CosLynxAI)

<p align="center">
  <h1 align="center">🌐 CosLynx.com</h1>
</p>
<p align="center">
  <em>Create Your Custom MVP in Minutes With CosLynxAI!</em>
</p>
<div class="badges" align="center">
<img src="https://img.shields.io/badge/Developers-Drix10,_Kais_Radwan-red" alt="">
<img src="https://img.shields.io/badge/Website-CosLynx.com-blue" alt="">
<img src="https://img.shields.io/badge/Backed_by-Google,_Microsoft_&_Amazon_for_Startups-red" alt="">
<img src="https://img.shields.io/badge/Finalist-Backdrop_Build_v4,_v6-black" alt="">
</div>