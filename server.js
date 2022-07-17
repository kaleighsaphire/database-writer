const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 8005
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'star-trek'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', (req, res) => {
    db.collection('star-trek-species').find().toArray()
        .then(data => {
            let nameList = data.map(item => item.speciesName)
            console.log(nameList)
            res.render('index.ejs', {info: nameList})
        })
        .catch(error => console.log(error))
})

app.post('/api', (req, res) => {
    console.log('Post Heard')
    db.collection('star-trek-species').insertOne(
        req.body
    )
    .then(result => {
        console.log(result);
        res.redirect('/')
    })
})

app.put('/updateEntry', (req, res) => {
    Object.keys(req.body).forEach(key => {
        if (req.body[key] === null || req.body[key] === undefined || req.body[key] === ''){
            delete req.body[key]
        }
    })
    console.log(req.body);
    db.collection('star-trek-species').findOneAndUpdate(
        {name: req.body.name}, 
        {
            $set: req.body
        }
    )
    .then(result => {
        console.log(result);
        res.json('Success')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteEntry', (req, res) => {
    db.collection('star-trek-species').deleteOne(
        {name: req.body.name}
    )
    .then(result => {
        res.json('Entry Deleted')
    })
    .catch(error => console.error(error))
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
    