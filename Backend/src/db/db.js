//data base ko kese connect krte hai uska logic idhr hota hai 

const mongoose = require('mongoose');

async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to db")
    } catch (error) {
        console.log("error while connecting to db",error)
    }
}

module.exports = connectDB;