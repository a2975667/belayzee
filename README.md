# README #

###Please start mongoDB service before starting the node server###
node server start command: npm start

###Remember to copy mongod.exe to the place where you want to store the data###
i.e
mkdir mongodb 
cd mongodb
mkdir data
move mongod.exe to the file mongodb
mongodb server start command: mongod --dbpath=data


###You can access to homepage using the url:###
http://localhost:3000/ or http://localhost:3000/index.html


###You can get all requests at:###
http://localhost:3000/requests


You can post the request in the following schema
{
    "requestID": "111111111111",
    "userID": "1155049075",
    "userName": "Lai Sunny",
    "Token": "999",
    "description": "This is my first request",
    "completeTime": "20/4/2016",
    "Catagory": "Maths"
}


e.g. you can download >>>postman<<< software for sending get/post/delete/put 



