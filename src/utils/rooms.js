const rooms = []

const addRoom = (room) => {

    console.log(rooms)

    //Clean the data
    room = room.trim().toLowerCase()

    //Validate the data
    if (!room) {
        return {
            error: "Room is required!"
        }
    }

    // Check for existing room
    const existingRoom = rooms.find((roomName) => {
        return  roomName === room
    })

    // Validate room
    if (existingRoom) {
        return {
            roomError: 'Room already made!'
        }
    }

    //Store room
    rooms.push(room)
    return { room }
}

const removeRoom = (room) => {
    console.log(rooms)
    const index = rooms.findIndex((findRoom) => findRoom === room )
    console.log(index)

    if (index !==1) {
        return rooms.splice(index, 1)[0]
    }

}

const getAllRooms = () => rooms

module.exports = {
    addRoom,
    removeRoom,
    getAllRooms

}