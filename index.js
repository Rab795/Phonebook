require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('body', function (request, response) { return JSON.stringify(request.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find().estimatedDocumentCount().then(count => {
    response.send(`<p>Phonebook has info for ${count} people</p>${new Date()}`)
  })
    
}) 

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person =>{
    response.json(person)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name ) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }
  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  Person.exists({ name : body.name }).then(result => {
    if(result) { 
      return response.status(400).json({ error: 'name must be unique'})
    } 
    
    const person = new Person({
      name: body.name,
      number: body.number
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })

  })

})

app.delete('/api/persons/:id', (request, response) => {
  Person.deleteOne({ _id : request.params.id}).then(note => {
    response.status(204).end()
  })
}) 

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})