require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idf9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;




const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});





async function run() {
  try {
  
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });


    //collections Names
    const datafile = client.db("assignment-10");
    const visaApplyCollection = datafile.collection("visa-apply-data");
    const visasCollection = datafile.collection("all-visas-data");
    const topContiesVisasCollection = datafile.collection("top-counties-visa");
    const applicationProcessCollection = datafile.collection("visa-application-process");


    app.get("/", (req, res) => res.send("Welcome to Rian's Server"));


    app.post('/visas-data', async(req,res)=>{
        const visa = req.body
        const result = await visasCollection.insertOne(visa)
        res.send(result)
    })

    app.post('/visa-apply', async(req,res)=>{
        const applyData = req.body
        const result = await visaApplyCollection.insertOne(applyData)
        res.send(result)
    })



    app.get('/visas-data-home',async(req,res)=>{
        const query= visasCollection.find().sort({ date: -1 }).limit(6)
        const result = await query.toArray()
        res.send(result)
   })


   app.get('/visas-data',async(req,res)=>{
    const query= visasCollection.find().collation({ locale: 'en', strength: 2 }).sort({ country: 1 });
    const result = await query.toArray()
    res.send(result)
})

   app.get('/top-countries-visa',async(req,res)=>{
    const query= topContiesVisasCollection.find()
    const result = await query.toArray()
    res.send(result)
})
   app.get('/visa-application-process',async(req,res)=>{
    const query= applicationProcessCollection.find()
    const result = await query.toArray()
    res.send(result)
})


app.get('/my-added-visas',async(req,res)=>{


  const email=req.query.email;
  const query= visasCollection.find({ userEmail: email })
  const result = await query.toArray()
  res.send(result)
})


app.get('/visa-apply',async(req,res)=>{

  const email=req.query.email;
  const query= visaApplyCollection.find({ userEmail: email })
  const result = await query.toArray()
  res.send(result)
})


//get singledata 
 app.get('/my-added-visas/:id', async(req,res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result=await visasCollection.findOne(query)
  res.send(result)
 })

  

 

  app.patch('/my-added-visas/:id', async(req,res)=>{
    const id = req.params.id
    const updatedData=req.body
    const query = {_id: new ObjectId(id)}
    const option={upsert:true}
    const updatedoc={
      $set:{
        imageUrl:updatedData.imageUrl,
        country:updatedData.country,
        visaType:updatedData.visaType,
        processingTime:updatedData.processingTime,
        description:updatedData.description,
        ageRestriction:updatedData.ageRestriction,
        fee:updatedData.fee,
        validity:updatedData.validity,
        applicationMethod:updatedData.applicationMethod
      }
    }

  
    const result =  await visasCollection.updateOne(query,updatedoc,option)
    res.send(result)
  
  
  })





  app.delete('/my-added-visas/:id', async(req,res)=>{
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await visasCollection.deleteOne(query)
    res.send(result)
  })


  app.delete('/my-visa-apply/:id', async(req,res)=>{
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await visaApplyCollection.deleteOne(query)
    res.send(result)
  })


app.get('/my-visa-apply-by-search', async(req,res)=>{
  const {searchPharams}=req.query
  let option={}
  if(searchPharams){
    option={country:{$regex:searchPharams,$options:'i'}}
  }

  const result = await visaApplyCollection.find(option).toArray()
  res.send(result)
})
  



    console.log("!!!!!!!!.......................MongoDB Server Connected....................!!!!!!!!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })