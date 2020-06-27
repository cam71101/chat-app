const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require ('./utils/users')
const { addRoom, removeRoom, getAllRooms }  = require('../src/utils/rooms')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {

        console.log(options)

        const { error, user} = addUser ({ id: socket.id, ...options })

        addRoom(user.room)

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))

        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        io.to(user.room).emit('test', {
            room: user.room
        })

        callback()
        
    })

    socket.on('roomsListQuery', () => {
        const rooms = getAllRooms()
        socket.emit('roomList', rooms)
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        const user = getUser(socket.id)


        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user)  {
            const users = getUsersInRoom(user.room)
            if (users.length === 0) {
                removeRoom(user.room)
            }
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

// const roomList = document.querySelector('existing-rooms')


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

// Let users pick from a list of active rooms or type in custom room name
// Show a dropdown, have a list of all active rooms, so html needs to connect to a list of rooms with socket.io. Add a javascript file and a little bit of code. 
// When a new user visits the chat, they should be able to type in the room name manually or they should be able to pick from a list of rooms that currently have someone inside of them.





// 