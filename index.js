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

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
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
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body
    const person = new Person({ name, number })
    person.save()
        .then(() => {
            console.log(`added ${person.name} ${person.number} to phonebook`)
            response.json(person)
        })
        .catch(error => next(error))
    morgan.token('body', request => JSON.stringify(request.body))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
