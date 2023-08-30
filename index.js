const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('dist'))


const customMorganPostFormat = ':method :url :status :response-time ms :body'
const customLogger = (req, res, next) => {
    if (req.method === 'POST') {
        morgan(customMorganPostFormat)(req, res, next)
    } else {
        morgan('tiny')(req, res, next)
    }
    next()
}

app.use(customLogger)


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    },
    {
        id: 654,
        name: "Testi Testinen",
        number: "1234321"
    }
]

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateId = () => {
    let id = getRandomInt(1, 1000000)
    while (persons.map(person => person.id).includes(id)) {
        id = getRandomInt(1, 1000000)
    }
    return id
}

app.get('/info', (request, response) => {
    const personsLength = persons.length
    const timeOfResponse = new Date()

    response.send(`<p>Phonebook has info for ${personsLength} people<br>${timeOfResponse}</p>`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
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
    } else if (persons.map(person => person.name).includes(body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
    morgan.token('body', request => JSON.stringify(request.body))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
