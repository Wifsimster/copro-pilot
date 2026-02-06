import NodeCache from 'node-cache'

// Default cache: TTL 5 minutes, check period 2 minutes
const cache = new NodeCache({
    stdTTL: 300,
    checkperiod: 120,
    useClones: false
})

export default cache
