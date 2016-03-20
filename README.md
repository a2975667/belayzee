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





# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact