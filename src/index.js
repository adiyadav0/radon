
const express = require('express');
const mongoose = require('mongoose');
const router = require('./route/route')

const app = express();
app.use(express.json());// --> ye req.body mai data ko set krta hai tabhi hum req se data ko get kr pa rhe hai


const url="mongodb+srv://functionup:Qa8Frz5zwqHmw33u@cluster0.3pryrpd.mongodb.net/group3Database";
mongoose.connect(url,{useNewUrlParser:true})

.then(()=>console.log("Mongoose connected"))
.catch(err=>console.log(err));

app.use('/',router);

app.listen(process.env.PORT || 3000 , function(){
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})


// ╔════════════════════════╗
// ❤ Index File 🔥🔥🔥     ❤
// ╚════════════════════════╝