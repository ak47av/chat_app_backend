const path = require('path');

const https = require('https');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');

const saveMessage = require('./middleware/saveMessage');

const app = express();

app.use(bodyParser.json());
app.use(cors());

dotenv.config();

AWS.config.region = 'us-east-1'
const s3 = new AWS.S3({
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
})

// const params = {
//     Bucket: 'couplechatappbucket',
//     CreateBucketConfiguration: {
//         LocationConstraint: "us-east-1"
//     }
// };
//
// const uploadFile = async(file) => {
//
//     const params = {
//         Bucket: 'couplechatappbucket',
//         Key: Date.now().toString() + '-' + file.originalname,
//         Body: file
//     };
//
//     s3.upload(params, function (err, data) {
//         if(err){
//             console.log(err,data);
//             throw err;
//         }else{
//             resolve(data);
//         }
//         console.log('File uploaded successfully');
//     });
//
// }


const uploadS3 = multer({
    storage:multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'couplechatappbucket',
        // metadata: (req,file,cb)=>{
        //     cb(null, {fieldName: file.fieldName})
        // },
        key: (req,file,cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
})

app.post('/upload', uploadS3.single('file'),(req,res,next)=>{
    console.log(req.file);
});


// const options = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

app.use('/auth',authRoutes);
app.use('/room',roomRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect('mongodb+srv://ak47av:'+ process.env.mongoDBpassword+'@cluster0-vrjwo.mongodb.net/data?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true } )
    .then(result => {
        const server = app.listen(8080);
        console.log("Server is listening on port 8080");
        const io = require('./socket').init(server);
        io.on('connection',socket => {
            socket.on('sendMessage', (message,room,user) => {
                socket.join(room);
                console.log(user+ ': ' + message+ ' in ' +room);
                io.sockets.in(room).emit('message', message,user);
                saveMessage(user,room,message)
                    .then(res=> console.log("Message saved"))
                    .catch(err=>console.log(err));
            })
        });
    })
    .catch(err => console.log(err));


