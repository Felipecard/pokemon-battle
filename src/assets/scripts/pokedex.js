
const ulElement = document.querySelector('#showPoks')

let offSet = 0

const showPok = (offSet) => {

    const urlPokedex = `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offSet}`

    fetch(urlPokedex)
    .then(response => response.json())
    .then(data => {

        pokeData = data.results
        console.log(data.results)

        ulElement.innerHTML += `
            ${
                pokeData.map((pokemon) => ( 
                    `
                    <li class='cardPok'>
                        <p class='namePoks'>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
                        <img class='imgPoks' src='https://pokeres.bastionbot.org/images/pokemon/${pokemon.url.toString().substring(34, pokemon.url.length - 1)}.png'>
                        <p class='number'>No. ${pokemon.url.toString().substring(34, pokemon.url.length - 1)}</p>
                        <button class="buttonInfo" id="botao2" onclick="infoPok(${pokemon.url.toString().substring(34, pokemon.url.length - 1)})" data-toggle="modal" data-target="#modal-contato" href="#">Info</button>
                    </li>
                    `
                )).join('')
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

        const name1 = data.name.charAt(0).toUpperCase() + data.name.slice(1)
        const kg = data.weight / 2.205 
        const kgRound = kg.toFixed(0)
        const force = data.base_experience
        const type = data.types[0].type.name
        const move1 = data.moves[Math.floor(Math.random() * 49 + 1)].move.name
        const move2 = data.moves[Math.floor(Math.random() * 49 + 1)].move.name
        const move3 = data.moves[Math.floor(Math.random() * 49 + 1)].move.name
        const move4 = data.moves[Math.floor(Math.random() * 49 + 1)].move.name

        element1.innerHTML = `
        <div>
            <h2 class='titleInfo'>${name1}</h2>
            <img class='infoImage' src='${data.sprites.other.dream_world.front_default}'>

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





