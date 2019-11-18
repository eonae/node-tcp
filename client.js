const net = require('net')

const { Terminal, errors } = require('./terminal')

let socket = null;
const terminal = new Terminal()

terminal.add('connect', params => {
        if (params.positional.length != 1) throw errors.invalidArgs()
        const [ host, port ] = params.positional[0].split(':')
        if (!host || !port) throw errors.invalidArgs()

        socket = net.createConnection({ host, port: parseInt(port) }, )
        socket.on('error', err => {
            console.log(err.message)
            socket = null
            return
        })

        socket.on('end', () => {
            console.log('socket was closed')
            socket = null
        })

        // Загрузка дочернего терминала. В случае выхода возвращаемся в следующий.
        // Синхронность!

        terminal.setPlainHandler(text => {
            if (socket) socket.write(text)
        })
        terminal.setPrompt('tcp $')
        

    }, { aliases: ['tcp'] })

terminal.setAlias('list', 'ls')
terminal.start()