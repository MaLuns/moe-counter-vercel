import fs from 'fs'
import path from 'path'
import { lookup } from 'mime-types'
import { imageSize } from 'image-size'

const themePath = path.resolve(__dirname, '../assets/theme')

const themeList = {}

const convertToDatauri = (path) => {
  const mime = lookup(path)
  const base64 = fs.readFileSync(path).toString('base64')
  return `data:${mime};base64,${base64}`
}

fs.readdirSync(themePath).forEach(theme => {
  if (!(theme in themeList)) themeList[theme] = {}
  const imgList = fs.readdirSync(path.resolve(themePath, theme))
  imgList.forEach(img => {
    const imgPath = path.resolve(themePath, theme, img)
    const name = path.parse(img).name
    const { width, height } = imageSize(imgPath)

    themeList[theme][name] = {
      width,
      height,
      data: convertToDatauri(imgPath)
    }
  })
})

export const themify = ({ count, theme = 'moebooru', length = 7 }) => {
  if (!(theme in themeList)) theme = 'moebooru'

  // This is not the greatest way for generating an SVG but it'll do for now
  const countArray = count.toString().padStart(length, '0').split('')

  let x = 0, y = 0
  const parts = countArray.reduce((acc, next, index) => {
    const { width, height, data } = themeList[theme][next]

    const image = `${acc}
      <image x="${x}" y="0" width="${width}" height="${height}" xlink:href="${data}" />`

    x += width

    if (height > y) y = height

    return image
  }, '')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${x}" height="${y}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="image-rendering: pixelated;">
    <title>Moe Count</title>
    <g>
      ${parts}
    </g>
</svg>
`
}
