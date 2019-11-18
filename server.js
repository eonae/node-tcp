const net = require('net')

const server = net.createServer(socket => {
    console.log('client connected...')
    socket.on('data', data => {
        console.log(data)
    })
});

server.listen(8900, () => console.log('tcp server is up!'))