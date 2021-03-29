
const express = require('express')
const app = express()
const path = require('path')


app.use(express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/src/pages/battle/index.html'))
})

app.get('/pokedex', (req, res) => {
    res.sendFile(path.join(__dirname + '/src/pages/pokedex/index.html'))
})

app.listen(3000, () => {
    console.log('Server keep walking....')
})