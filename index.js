const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 2000;
require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywrmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(uri);
async function run () {
    try{
        await client.connect();
        const database = client.db("Loan-database");
        const loanCollections = database.collection("LoanCollections");
        const loanDatabase = database.collection("loans-collections");
        const userDatabase = database.collection("users-collections");
        const usersCollection = database.collection("users");

        app.get('/loans', async (req, res) => {
            const query = loanDatabase.find({});
            const result = await query.toArray();
            res.json(result);
        })

      app.post('/loanRequest', async (req, res) =>{
          const user = req.body;
          const result = await userDatabase.insertOne(user);
          res.json(result);
      })
      app.get('/loanRequest', async (req, res) =>{
          const email = req.query.email;
          const query = {email: email};
          const result = await userDatabase.find(query).toArray();
          res.json(result);
      })

      app.get('/allLoanRequest', async (req, res) =>{
          const user = userDatabase.find({});
          const result = await user.toArray();
          res.json(result);
      })

      app.delete('/allLoanRequest/:id', async (req, res) =>{
        const id = req.params.id;
        console.log(id);
        const query = {_id: ObjectId(id)};
        console.log(query);
        const result = await userDatabase.deleteOne(query);
        res.json(result);
      })

      app.get("/allLoanRequest", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const updateItem = await userDatabase.findOne(query);
        res.send(updateItem);
    });

      app.put("/allLoanRequest/:id", async (req, res) => {
        const id = req.params.id;
        // console.log(req);
        const updatedStatus = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                status: updatedStatus.status,
            },
        };
        const result = await userDatabase.updateOne(
            filter,
            updateDoc,
            options
        );
        res.send(result);
    });

    app.post('/users', async (req, res) =>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      })
    
      app.put('/users', async (req, res) => {
       const user = req.body;
       const filter = { email: user.email};
       const option = {upsert: true};
       const updateDoc= {
           $set: user
       };
       const result = await usersCollection.updateOne(filter, updateDoc, option);
       res.json(result);
   });

    //making admin 
    app.put('/users/admin', async (req, res) =>{
        const user = req.body;
       //  const decodedUser = await admin.auth();
       //  req.decodedEmail = decodedUser.email;
       //  if(req.decodedEmail)
       //  {
 
       //  }
        const filter = {email: user.email};
        const updateDoc = {$set:{role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
     })

    //Checking admin
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin')
        {
          isAdmin = true;
        }
        res.json({admin: isAdmin});
      })

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', async (req, res) => {
    res.send("Loan processing system server running");
})
app.listen(port, ()=>{
    console.log("listening on port" + port);
});


