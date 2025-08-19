import express from 'express';
const app=express()
import cookie_parser from 'cookie-parser';
import cors from 'cors';
import connectDB from './utils/db.js'; // Import the database connection utility
import routes from './routes/user.route.js'; // Import user routes
import companyRoutes from './routes/company.route.js'; // Import company routes
import jobRoutes from './routes/job.route.js'; // Import job routes
import applicationRoutes from './routes/application.route.js'; // Import application routes
import bookmarkRoutes from './routes/bookmark.route.js'; // Import bookmark routes
import 'dotenv/config';
const port=process.env.PORT || 8000; // Use PORT from environment variables or default to 8000


app.use(express.json())
app.use(cookie_parser())
app.use(express.urlencoded({extended:true}))
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow React frontend from both localhost and 127.0.0.1
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all common methods
  credentials: true,              // Allow cookies/auth headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie']
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

app.get('/',(req,res)=>{
    return res.status(200).json({
        message:"Welcome to the server",
        success:true

    })
});

app.use('/api/v1/user', routes); // Use user routes
app.use('/api/v1/company', companyRoutes); // Use company routes
app.use('/api/v1/job', jobRoutes); // Use job routes
app.use('/api/v1/application', applicationRoutes); // Use application routes
app.use('/api/v1/bookmark', bookmarkRoutes); // Use bookmark routes


app.listen(port ,()=>{
    connectDB(); // Connect to the database
    console.log(`Server is running on http://localhost:${port}`)
})