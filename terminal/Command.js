module.exports = class Command {
    
    constructor(name, func, options) {
        this.name = name
        this.func = func
        this.isInternal = false
        this.aliases = []
        if (options) {
            this.isInternal = options.isInternal || false
            this.aliases = options.aliases || []
        }
    }

    execute(params) {
        this.func(params)
    }
}