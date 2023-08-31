const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

const customMorganPostFormat = ':method :url :status :response-time ms :body'

const customLogger = (req, res, next) => {
    if (req.method === 'POST') {
        morgan(customMorganPostFormat)(req, res, next)
    } else {
        morgan('tiny')(req, res, next)
    }
}

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(customLogger)




// app.get('/info', (request, response) => {
//     const personsLength = persons.length
//     const timeOfResponse = new Date()

//     response.send(`<p>Phonebook has info for ${personsLength} people<br>${timeOfResponse}</p>`)
// })

app.get('/api/persons/', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and number must be included'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(result => {
        console.log(`added ${person.name} ${person.number} to phonebook`)        
    })

    response.json(person)
    morgan.token('body', request => JSON.stringify(request.body))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
