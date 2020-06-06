const socketio = require('socket.io');
const parseStringAsArray = require('./utils/parseStringAsArray');
const calculateDistence = require('./utils/calculateDistence');
const connections = [];

let io;

exports.setupWebsocket = (server) => {
    io = socketio(server);

    io.on('connection', socket => {
        const { latitude, longitude, techs } = socket.handshake.query;

        connections.push({
            id: socket.id,
            coordinates: {
                latitude: Number(latitude),
                longitude: Number(longitude),
            },
            techs: parseStringAsArray(techs),
        });

    });
}

exports.findConnections = (coordinates, techs) => {
    const teste = {
        coordinates, techs, connections
    }

    return connections.filter(connection => {
        return calculateDistence(coordinates, connection.coordinates) < 10
        && connection.techs.some(item => techs.includes(item))
    });
}

exports.sendMessage = (to, message, data) => {
    to.forEach(conn => {
        io.to(conn.id).emit(message, data);
    });
}