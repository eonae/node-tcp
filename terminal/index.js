const Command = require('./Command')


const _commands = []

let _prompt = '>'
let _plain = null

const errors = {
    commandNotFound: name => new Error(`Command <${name}> not found!`),
    identifierTaken: ident => new Error(`Identifier <${ident}> matches name or alias of existing command`),
    invalidIdentifier: ident => new Error(`Identifier <${ident}> should not contain spaces`),
    invalidArgs: () => new Error(`Invalid args!`),
    notFunction: ident => new Error(`Parameter <${ident}> should be a function`)
}

const prompt = () => process.stdout.write(_prompt + ' ')

const tryFindCmd = ident => {
    const cmd = _commands.find(c => c.name == ident || c.aliases.includes(ident))
    if (!cmd) throw errors.commandNotFound(ident)
    return cmd
}

const listener = buffer => {

    const input = parseInput(buffer)
    try {
        const cmd = tryFindCmd(input.command)
        cmd.execute(input.params)
    }
    catch (err) {
        if (_plain) _plain(input.plain)
        else console.log(err.message)
    }
    finally {
        prompt()
    }
}
const parseInput = buffer => {

    const pattern = /\s|\n|\r\n|\r/
    const arr = buffer.toString().split(pattern).filter(x => x);

    const input = {
        command: arr.shift(),
        plain: buffer.toString(),
        params: {
            positional: [],
            args: [],
            keys: []
        }
    }

    let currentArg

    arr.forEach(i => {

        input.params.positional.push(i)
        if (!i.startsWith('-') && currentArg) {
            input.params.args[currentArg] = i
            currentArg = undefined

        } else if (i.startsWith('--')) {
            input.params.keys.push(i)

        } else if (i.startsWith('-')) {
            currentArg = i
        }
    })

    return input
}
const throwIfInvalidIdentifier = ident => {

    if (ident.includes(' ')) throw errors.invalidIdentifier(ident)

    const taken = _commands
        .reduce((acc, c) => [...acc, c.name, ...c.aliases], [])
        .includes(ident)

    if (taken) throw errors.identifierTaken(taken)
}
const throwIfNotFunction = func => {
    if (typeof func !== 'function')
        throw errors.throwIfNotFunction(func.toString())
}

_commands.push(new Command('quit', () => {
        console.log('<<<<< Program completed >>>>>')
        process.exit()
    },
    { isInternal: true }))

_commands.push(new Command('list', args => console.dir(_commands), { isInternal: true }))

class Terminal {

    start() {
        process.stdin.on('data', listener)  
        prompt()
    }

    add(name, func, options) {
        if (!name) throw errors.invalidArgs()
        throwIfInvalidIdentifier(name)
        if (options && options.aliases) {
            options.aliases.forEach(a => throwIfInvalidIdentifier(a))
        }
        throwIfNotFunction(func)
        _commands.push(new Command(name, func, options))
        return this
    }

    setPrompt(str) {
        _prompt = str
    }

    setPlainHandler(func) {
        throwIfNotFunction(func)
        _plain = func
        return this
    }

    renameCmd(name, newName) {
        
        const cmd = tryFindCmd(name)
        throwIfInvalidIdentifier(newName)
        cmd.name = newName
        return this
    }

    setAlias(name, alias) {

        const cmd = tryFindCmd(name)
        throwIfInvalidIdentifier(alias)
        cmd.aliases.push(alias)
        return this
    }
}

module.exports = { Terminal, errors }
