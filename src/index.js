const express = require('express');
require('dotenv').config();

// model start
const app = express();
const PORT = process.env.PORT || 5000 
const attendanceRouter = require('./routes/attendanceRoute');
const employeeRouter = require('./routes/employeeRoute');

const cors = require('cors')
app.use(cors({
    origin: '*'
}))

// app use
app.use(express.json());

app.get('/api/v1', async (req,res) => {
    res.send({message: 'hello'})
})
app.use('/api/v1',employeeRouter);
app.use('/api/v1',attendanceRouter);



app.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
})
