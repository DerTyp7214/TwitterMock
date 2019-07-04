const app = require('express')()
const Twitter = require('twitter')
const Jimp = require('jimp')
const config = require('./config.json')
const twitterClient = new Twitter(config)

const mock = text => text.split('').map(c => Math.random() >= 0.5 ? c.toUpperCase() : c.toLowerCase()).join('')

app.get('/:id', (req, res) => {
    twitterClient.get('statuses/show', { id: req.params.id, tweet_mode: 'extended' }, function(error, tweets, response) {
        if (error) {
            res.statusCode = response.statusCode
            res.send(response)
        } else {
            Jimp.read('./mock.png')
                .then(image => {
                    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE)
                        .then(font => {
                            image.print(font, 0, 0, {
                                text: mock(JSON.parse(response.body).full_text),
                                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                                alignmentY: Jimp.VERTICAL_ALIGN_TOP
                            }, image.getWidth(), image.getHeight())
                            Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)
                                .then(miniFont => {
                                    image.print(miniFont, 0, 0, {
                                        text: JSON.parse(response.body).user.name,
                                        alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
                                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                                    }, image.getWidth(), image.getHeight())
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
        }
    })
})

app.listen(1337)