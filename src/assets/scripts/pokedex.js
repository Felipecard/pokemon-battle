
const ulElement = document.querySelector('#showPoks')

let offSet = 0

const capitalize = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const getPokemonIdFromUrl = (url) => {
    return url.split('/').filter(Boolean).pop()
}

const getPokemonArtworkUrl = (pokemonId) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
}

const getPokemonInfoImage = (pokemon) => {
    return pokemon.sprites.other?.['official-artwork']?.front_default
        || pokemon.sprites.other?.dream_world?.front_default
        || pokemon.sprites.front_default
        || getPokemonArtworkUrl(pokemon.id)
}

const getRandomMoveName = (moves) => {
    if (!moves.length) {
        return 'No move'
    }

    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex].move.name
}

const showPok = (offSet) => {

    const urlPokedex = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offSet}`

    fetch(urlPokedex)
    .then(response => response.json())
    .then(data => {

        pokeData = data.results
        console.log(data.results)

        ulElement.innerHTML += `
            ${
                pokeData.map((pokemon) => {
                    const pokemonId = getPokemonIdFromUrl(pokemon.url)

                    return `
                    <li class='cardPok'>
                        <p class='namePoks'>${capitalize(pokemon.name)}</p>
                        <img class='imgPoks' src='${getPokemonArtworkUrl(pokemonId)}' alt='${capitalize(pokemon.name)}'>
                        <p class='number'>No. ${pokemonId}</p>
                        <button class="buttonInfo" id="botao2" onclick="infoPok(${pokemonId})" data-toggle="modal" data-target="#modal-contato" href="#">Info</button>
                    </li>
                    `
                }).join('')
            }
        `
    })

}

  
showPok(offSet)

const morePokemons = () => {
    offSet += 20
    showPok(offSet)
}


const infoPok = (pokNumber) => {

    const url = `https://pokeapi.co/api/v2/pokemon/${pokNumber}/`
    
    fetch(url) 

    .then(response => response.json())
    .then(data => {
    
        element1 = document.querySelector('#pokInfos')

        const name1 = capitalize(data.name)
        const kg = data.weight / 2.205 
        const kgRound = kg.toFixed(0)
        const force = data.base_experience
        const type = data.types[0].type.name
        const move1 = getRandomMoveName(data.moves)
        const move2 = getRandomMoveName(data.moves)
        const move3 = getRandomMoveName(data.moves)
        const move4 = getRandomMoveName(data.moves)

        element1.innerHTML = `
        <div>
            <h2 class='titleInfo'>${name1}</h2>
            <img class='infoImage' src='${getPokemonInfoImage(data)}' alt='${name1}'>

            <div class='dataPok'>
                <p>❏ Weight: ${kgRound} Kg</p>
                <p>❏ Type: ${type}</p>
                <p>❏ Experience: ${force}</p>
                <p>❏ Some moves: ${move1}/ ${move2}/ ${move3}/ ${move4}</p>  
            </div>
        </div>
        `
    console.log(data)

})

.catch(err => console.log(err))

}



