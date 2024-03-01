import { themify } from '../lib/themify'
import { setNumMulti, getNum } from "../lib/db"


const PLACES = 7
let __cache_counter = {}, shouldPush = true

setInterval(() => { shouldPush = true }, 1000 * 60)

const pushDB = async () => {
    if (!shouldPush) return
    try {
        shouldPush = false
        if (Object.keys(__cache_counter).length === 0) return

        const counters = Object.keys(__cache_counter).map(key => {
            return {
                name: key,
                num: __cache_counter[key]
            }
        })

        await setNumMulti(counters)
        __cache_counter = {}
    } catch (error) {
        console.log("pushDB is error: ", error)
    }
}

const getCountByName = async (name) => {
    const defaultCount = { name, num: 0 }
    if (name === 'demo' || name === '') return { name, num: '0123456789' }

    try {
        if (!(name in __cache_counter)) {
            const counter = await getNum(name) || defaultCount
            __cache_counter[name] = counter.num + 1
        } else {
            __cache_counter[name]++
        }
        pushDB()
        return { name, num: __cache_counter[name] }
    } catch (error) {
        console.log("get count by name is error: ", error)
        return defaultCount
    }
}


export default async (req, res) => {
    const { name = 'demo', theme = 'moebooru' } = req.query
    const data = await getCountByName(name)

    let length = PLACES

    if (name === 'demo') {
        res.setHeader('cache-control', 'max-age=31536000')
        length = 10
    }

    res.setHeader('content-type', 'image/svg+xml')
    res.setHeader('cache-control', 'max-age=0, no-cache, no-store, must-revalidate')
    res.send(themify({ count: data.num, theme: theme, length }))
    res.end()
}