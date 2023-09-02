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

const errorHandler = (error, request, response, next) =>{
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(customLogger)


app.get('/info', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.send(`Phonebook has info for ${persons.length} people. ${new Date()}`)
        })
        .catch(error => next(error))
})

app.get('/api/persons/', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
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

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
