const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')
// Routes 
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.route');

//server instance
const app = express();

//middlewares
app.use(cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PUT','DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


//creating routes
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);
module.exports = app;