import type { VercelRequest, VercelResponse } from '@vercel/node';
import themify from '../lib/themify';
import db from "../lib/db";


const PLACES = 7
let __cache_counter: Record<string, number> = {}, shouldPush = true

setInterval(() => { shouldPush = true }, 1000 * 60);

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

        await db.setNumMulti(counters)
        __cache_counter = {}
    } catch (error) {
        console.log("pushDB is error: ", error)
    }
}

const getCountByName = async (name: string) => {
    const defaultCount = { name, num: 0 }
    if (name === 'demo') return { name, num: '0123456789' }

    try {
        if (!(name in __cache_counter)) {
            const counter = await db.getNum(name) || defaultCount
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


export default async (req: VercelRequest, res: VercelResponse) => {
    const { name, theme = 'moebooru' } = req.query

    let length = PLACES

    res.setHeader('content-type', 'image/svg+xml')
    res.setHeader('cache-control', 'max-age=0, no-cache, no-store, must-revalidate')

    const data = await getCountByName(<string>name)

    if (name === 'demo') {
        res.setHeader('cache-control', 'max-age=31536000')
        length = 10
    }

    const renderSvg = themify({ count: data.num, theme: <string>theme, length })
    res.send(renderSvg)
}