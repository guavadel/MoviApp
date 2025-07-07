# Backend Setup Instructions

## 1. Install Dependencies
```bash
cd backend
npm install
```

## 2. Set up Environment Variables
Create a `.env` file in the backend folder with:
```
MONGODB_URI=mongodb://127.0.0.1:27017/movie_app
PORT=5000
```

## 3. Local MongoDB Setup
You're using a local MongoDB instance. Make sure:
1. MongoDB is running on your machine (port 27017)
2. No authentication is required (default local setup)
3. The database `movie_app` will be created automatically

## 4. Start the Server
```bash
npm run dev
```

The server will start on http://localhost:5000

## 5. Test the API
- Visit http://localhost:5000/api/trending to see trending movies
- Visit http://localhost:5000/api/most-searched to see most searched movies 