const express = require('express')
const app =  express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000


//middleware
app.use(cors())
app.use(express.json())


//DB connectivity string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3dal.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run (){
try{
    await client.connect();
    console.log('database is connected')
    const database = client.db('ema_john_online_shop')
    const productCollection = database.collection('products')
    const orderCollection = database.collection('orders')

    // GET Products API
    app.get('/products' , async(req,res) =>{
        const cursor = productCollection.find({})
        const page = req.query.page
        const size =   parseInt(req.query.size) 
        const count = await cursor.count()
        let products
        if(page){
            products = await cursor.skip(page*size).limit(size).toArray()
        }
        else{
            products = await cursor.toArray()
        }
         
        
        res.send({ 
            count , 
            products 
        });
    })

    // Use POST to get data by keys
    app.post('/products/bykeys' , async(req,res)=>{
        console.log(req.body)
        const keys = req.body;
        const query = {key:{$in:keys}}
        const products = await productCollection.find(query).toArray();
        res.json(products) 
    })

    // Add Orders API
    app.post('/orders', async(req , res) =>{
        const order = req.body
        const result = await orderCollection.insertOne(order)
        res.json(result)
    })






}
finally{
    // await client.close();
}
}

run().catch(console.dir)



// to get the response at frontend(browser)
app.get('/' , (req,res)=>{
    res.send('Ema John server is running')
})


// to get the response at backend(node server)
app.listen(port , ()=>{
    console.log('server running at port' , port)
})