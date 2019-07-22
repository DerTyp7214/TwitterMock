// copyright by DerTyp7214 (Josua Lengwenath)

const app = require('express')()
const Twitter = require('twitter')
const Jimp = require('jimp')
const config = require('./config.json')
const twitterClient = new Twitter(config)

const mock = text => text.split('').map(c => Math.random() >= 0.5 ? c.toUpperCase() : c.toLowerCase()).join('')

app.get('/alla/api/:id', (req, res) => {
    twitterClient.get('statuses/show', { id: req.params.id, tweet_mode: 'extended' }, function (error, tweets, response) {
        Jimp.read('./m.png')
            .then(image => {
                image.scale(.7)
                    .brightness(-.2)
                let name = ''
                let text = {
                    text: response.statusCode.toString(),
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }
                let fontStyle = Jimp.FONT_SANS_128_WHITE
                if (response.statusCode == 200) {
                    name = JSON.parse(response.body).user.name
                    text = {
                        text: mock(JSON.parse(response.body).full_text),
                        alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                        alignmentY: Jimp.VERTICAL_ALIGN_TOP
                    }
                    fontStyle = Jimp.FONT_SANS_64_WHITE
                }
                Jimp.loadFont(fontStyle)
                    .then(font => {
                        image.print(font, 15, 15, text, image.getWidth() - 35, image.getHeight() - 35)
                        Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
                            .then(miniFont => {
                                image.print(miniFont, 0, 0, {
                                    text: name,
                                    alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
                                    alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                                }, image.getWidth() - 2, image.getHeight() - 2)
                                image.getBase64Async(image._originalMime)
                                    .then(base64 => {
                                        const img = Buffer.from(base64.replace('data:image/png;base64,', ''), 'base64')
                                        res.writeHead(200, {
                                            'Content-Type': 'image/png',
                                            'Content-Length': img.length
                                        })
                                        res.end(img)
                                    })
                            })
                    })
            })
    })
})

app.listen(config.port)