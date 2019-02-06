const _=require('lodash');
const express=require('express');
const http = require('http');
const WebSocket = require('ws');
const path=require('path');
var url = require('url');
const fs=require('fs');
let cors=require('cors');
const server = http.createServer();
const wss1 = new WebSocket.Server({ noServer: true });

var mongoose= require('./server/db/mongoose.js');
var {User}= require('./server/models/user.js');
var {ambulance}= require('./server/models/ambulance.js');


var bodyParser= require('body-parser');

//important parameters in order for code to run
let app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
const publicPath = path.join(__dirname, '/uploads');
app.use(express.static(path.join(__dirname,'/images')));
app.set('viewengine','ejs');

app.get("/",(req,res)=>{ //main
       User.find({verified:false},(err,results)=>{

           res.render('dashboard.ejs',{
               users:results
       })

     });

    //res.render('login.ejs');

});
//route for signing up new user
app.post('/signup',(req,res)=>{
    f_count=0;
    User.countDocuments({}, function (err, count) {

    var user = new User({
        name:req.body.name,
        mobile_Number:req.body.number,
        "loc": {
            "type": "Point",
            "coordinates": [req.body.long, req.body.lat]
        },
        gender:req.body.gender,
        password:req.body.password,
        blood_grp:req.body.blood_grp,
        user_id:count

    })
    //console.log(req.body);
    var name1 = './images/'+count+'profile'+'.jpg';
    var name2 = './images/'+count+'citFront'+'.jpg';
    var name3 = './images/'+count+'citBack'+'.jpg';
    var img1 = req.body.image;
    var img2=req.body.image_citFront;
    var img3=req.body.image_citBack;
    var realFile1 = Buffer.from(img1,"base64");
        var realFile2 = Buffer.from(img2,"base64");
            var realFile3 = Buffer.from(img3,"base64");
    fs.writeFile(name1, realFile1, function(err) {
        if(err)
           console.log(err);
     });
     fs.writeFile(name2, realFile2, function(err) {
         if(err)
            console.log(err);
      });
      fs.writeFile(name3, realFile3, function(err) {
          if(err)
             console.log(err);
       });
        user.save().then((result,err)=>{
            res.send('user successfully created');
        });
    });
});

//ambulance signup
app.post('/ambulance',(req,res)=>{
    ambulance.countDocuments( function (err, count) {
        console.log('hey')
    var obj=new ambulance({name:req.body.name,mobile_Number:req.body.number,
        "loc": {
            "type": "Point",
            "coordinates": [req.body.long, req.body.lat]
        },"vehicle_id":count+1});
        obj.save().then((result,err)=>{

            res.redirect('/');
        })
        })
})
//get ambulance data
app.get('/getambulance',(req,res)=>{

//     ambulance.aggregate(
//         [
//             { "$geoNear": {
//                 "near": {
//                     "type": "Point",
//                     "coordinates": [parseFloat(req.query.long),parseFloat(req.query.lat)] // first  longitude then latitude --- if
//                     //place is at west use "-" sign ahead.
//                 },
//                 "distanceField": "distance",
//                 "spherical": false,
//                 "maxDistance": 10000
//             }}
//         ],
//         function(err,results) {
//            if (results)
//            {
//                var  final_result=[];
//                _.forEach(results,function(result){
//
//                        send_data={
//                            "id":result.vehicle_id,
//                            "latitude":result.loc.coordinates[1],
//                            "longitude":result.loc.coordinates[0],
//                            "name":result.name,
//                            "number":result.mobile_Number,
//                            "online":result.online,
//                            "distance":result.distance
//                        }
//                        final_result.push(send_data);
//                    })
// res.send(final_result);           }
//        }
//    )
ambulance.find({"t":1},(err,results)=>{
    if (results)
               {
                   var  final_result=[];
                   _.forEach(results,function(result){

                           send_data={
                               "id":result.vehicle_id,
                               "latitude":result.loc.coordinates[1],
                               "longitude":result.loc.coordinates[0],
                               "name":result.name,
                               "number":result.mobile_Number,
                               "online":result.online,
                               "distance":result.distance
                           }
                           final_result.push(send_data);
                       })
                       res.send(final_result);
}

})
})
    //to search the required donor

    app.post('/search_donor',(req,res)=>{
        console.log( req.query);
        User.aggregate(
            [
                { "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [parseFloat(req.body.long),parseFloat(req.body.lat)] // first  longitude then latitude --- if
                        //place is at west use "-" sign ahead.
                    },
                    "distanceField": "distance",
                    "spherical": false,
                    "maxDistance": 10000
                }}
            ],
            function(err,results) {
                // console.log(err);
                // console.log(results);
               if (results)
               {
                   final_result=[];
                   _.forEach(results,function(result){
                       if ((result.blood_grp == req.body.blood_grp) && (result.gender == req.body.gender) && (result.user_id != parseInt(req.body.userid))){
                           send_data={
                               "id":result.user_id,
                               "latitude":result.loc.coordinates[1],
                               "longitude":result.loc.coordinates[0],
                               "credits":result.credits,
                               "gender":result.gender,
                               "blood_grp":result.blood_grp

                           }
                           final_result.push(send_data);
                       }

                   })

               }
               res.send(final_result);
            }
        )
    })

    // for socket

    wss1.on('connection',function connection(ws) {


      ws.on('message', function incoming(message) {

          parsedData = JSON.parse(message);
          ws.userid=parsedData.userId;
          User.findOneAndUpdate({user_id:ws.userid},{online:true},(err,result)=>{

          })
         console.log(parsedData);
        console.log('received: %s', parsedData.msg);
        wss1.clients.forEach(function each(client) {
            // if (client.userid){
            //     User.findOneAndUpdate({user_id:client.userid},{online:true},()=>{
            //         console.log('status changed');
            //     })
            // }

         if (client.userid == parsedData.sendId && client.readyState === WebSocket.OPEN) {
             if (parsedData.userId > parsedData.sendId)
             {
                 s=parsedData.sendId;
                 p=parsedData.userId;
             }else{
                 p=parsedData.sendId;
                 s=parsedData.userId;
             }
             fs.appendFile('./messageFiles/'+s+'-'+p+'.txt',JSON.stringify({"userid":parsedData.userId,"message":parsedData.msg})+'\n', (err) => {
       if (err) throw err;
       console.log('The "data to append" was appended to file!');
     });
           client.send(JSON.stringify({"msg":parsedData.msg,"send":"notown"}));
            ws.send(JSON.stringify({"msg":parsedData.msg,"send":"own"}));

         }
          });
      });


      // ws.send('hey there! welcome from 1!');
    });

//     function intervalfunction(){
// console.log("ma call bhairaxu")
//         wss1.clients.forEach(function(client){
//
//             if (client.userid){
//                 c=0;
//                 User.find({verified:false},(err,results)=>{
//                     console.log(results);
//                     _.forEach(results,function(result){
//                         if (client.userid == result.user_id)
//                         {
//                             c=c+1;
//                         }
//                     })
//                 })
//                 console.log("c ko value",c)
//                 if (c==0){
//                     User.findOneAndUpdate({user_id:client.userid},{online:true},(err,result)=>{
//                         console.log('call bhaye hai');
//                     })
//                 }
//
//             }
//
//         })
//
//     }
//
//     setInterval(intervalfunction,4000);


    server.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/foo') {
        wss1.handleUpgrade(request, socket, head, function done(ws) {
          wss1.emit('connection', ws, request);
        });
      } else if (pathname === '/bar') {
        wss2.handleUpgrade(request, socket, head, function done(ws) {
          wss2.emit('connection', ws, request);
        });
      } else {
          console.log('ma call bhaye');
        socket.destroy();
      }
    });
app.get('/test',(req,res)=>{
    User.countDocuments({ gender: 'male' }, function (err, count) {
  console.log('there are %d jungle adventures', count);
});


});

//login route
app.post('/login',(req,res)=>{
  User.findOne({mobile_Number:parseInt(req.body.number),password:req.body.password},(err,result)=>{

      if(err){
          res.send('user not found');
      }
      if (result){
          send_data={
              "id":result.user_id,
               "name":result.name,
              "credits":result.credits,
              "gender":result.gender,
              "blood_grp":result.blood_grp

          }
          res.send(send_data);
      }


  }).then((err)=>{
      res.send('user not found');
  })

})

//to verify the user
app.get('/verify',(req,res)=>{
    console.log(req.query);
    var user_id=req.query.id;
    User.findOneAndUpdate({user_id:user_id},{verified:true},()=>{
        res.redirect("/");
    })
})
//image upload function
app.use(express.static(__dirname+'/public'));

app.post("/image", function(req, res){
  var name = req.body.name;
  var img = req.body.image;
  var realFile = Buffer.from(img,"base64");
  fs.writeFile(name, realFile, function(err) {
      if(err)
         console.log(err);
   });
   res.send("OK");
 });
//routes for website
app.get('/get_unverified',(req,res)=>{
    User.find({verified:false},(err,results)=>{
        res.send(results);
    })
})


//socket route
server.listen(8080);

//main server route
 app.listen(3000,()=>{
     console.log('server is high')
  })
