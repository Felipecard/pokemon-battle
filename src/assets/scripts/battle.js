
const search = () => {

    const pokName = document.getElementById('input').value

   
    const url = `https://pokeapi.co/api/v2/pokemon/${pokName}/`
    
    fetch(url) 

    .then(response => response.json())
    .then(data => {
    
    element1 = document.getElementById('halfScreen')

    const name1 = data.name.charAt(0).toUpperCase() + data.name.slice(1)
    const kg = data.weight / 2.205 
    const kgRound = kg.toFixed(0)
    const force = data.base_experience
    const number = data.id

    const type = data.types[0].type.name

    document.querySelector('#powerId').style.color = 'rgb(121, 255, 121)'
    document.querySelector('#textScreen').style.display = 'none'
    document.querySelector('#ball').style.display = 'none'

    setTimeout(function() {element1.innerHTML = `<img class='ballCome' src='../../assets/img/ballOpen1.png'>`}, 0)
    setTimeout(function() {element1.innerHTML = `<img class='ballCome2' src='../../assets/img/ballOpen1.png'>`}, 50)
    setTimeout(function() {element1.innerHTML = `<img class='openBall' src='../../assets/img/ballOpen1.png'>`}, 300)
    setTimeout(function() {element1.innerHTML = `<img class='openBall' src='../../assets/img/ballOpen2.png'>`}, 900)
    setTimeout(function() {element1.innerHTML = `<img class='openBall' src='../../assets/img/ballOpen3.png'>`}, 1200)
    setTimeout(function() {element1.innerHTML = `<img class='openBall' src='../../assets/img/ballOpen4.png'>`}, 1500)

    setTimeout(function() {element1.innerHTML = `
        <div id='pokemon1' data-name1='${name1}' data-force='${force}' data-type='${type}'>
            <div class='dataPok'>
                <h2>${name1}</h2>
                <div class='lifeBar'><div class='life1'></div></div>
                <p>No: ${number}</p>
                <p>Weight: ${kgRound} Kg</p>
                <p>Type: ${type}</p>
            </div>
            <img class='imageFront' src='${data.sprites.front_default}'>
        </div>
        `
    console.log(data)


}, 1800) })

.catch(err => console.log(err))


}



const search2 = () => {

    const pokName2 = document.getElementById('input2').value

   
    const url2 = `https://pokeapi.co/api/v2/pokemon/${pokName2}/`
    

    fetch(url2)


    .then(response2 => response2.json())
    .then(data2 => {
    
    element2 = document.getElementById('halfScreen2')

    const name2 = data2.name.charAt(0).toUpperCase() + data2.name.slice(1)
    const kg2 = data2.weight / 2.205 
    const kgRound2 = kg2.toFixed(0)
    const force2 = data2.base_experience
    const number2 = data2.id

    const type2 = data2.types[0].type.name

   
    document.querySelector('#ball').style.display = 'none'
    document.querySelector('#textScreen').style.display = 'none'

    setTimeout(function() {element2.innerHTML = `<img class='ballComePok2' src='../../assets/img/ballOpen1.png'>`}, 0)
    setTimeout(function() {element2.innerHTML = `<img class='ballComePok2-2' src='../../assets/img/ballOpen1.png'>`}, 50)
    setTimeout(function() {element2.innerHTML = `<img class='openBall2' src='../../assets/img/ballOpen1.png'>`}, 300)
    setTimeout(function() {element2.innerHTML = `<img class='openBall2' src='../../assets/img/ballOpen2.png'>`}, 900)
    setTimeout(function() {element2.innerHTML = `<img class='openBall2' src='../../assets/img/ballOpen3.png'>`}, 1200)
    setTimeout(function() {element2.innerHTML = `<img class='openBall2' src='../../assets/img/ballOpen4.png'>`}, 1500)

    setTimeout(function() {element2.innerHTML = `

    <div id='pokemon2' data-name2='${name2}' data-force2='${force2}' data-type2='${type2}'>
        <div class='dataPok2'>
            <h2>${name2}</h2>
            <div class='lifeBar'><div class='life2'></div></div>
            <p>No: ${number2}</p>
            <p>Weight: ${kgRound2} Kg</p>
            <p>Type: ${type2}</p>
        </div>

        <img class='imageBack' src='${data2.sprites.back_default}'></img>
    </div>
    `

}, 1800) })

.catch(err2 => console.log(err2))
 
}



const fight = () => {

    const pokemon1 = document.querySelector('#pokemon1')
    var pokemon1Force = parseInt(pokemon1.dataset.force)
    const namePok1 = pokemon1.dataset.name1

    const typePokemon1 = pokemon1.dataset.type
    
    

    const pokemon2 = document.querySelector('#pokemon2')
    var pokemon2Force = parseInt(pokemon2.dataset.force2)
    const namePok2 = pokemon2.dataset.name2

    const typePokemon2 = pokemon2.dataset.type2
    
    console.log(pokemon1Force)
    console.log(pokemon2Force)

    var pokemon1Advantage = pokemon1Force
    var pokemon2Advantage = pokemon2Force


    if (typePokemon1 === 'water' && (typePokemon2 == 'fire' || typePokemon2 == 'ground' || typePokemon2 == 'rock')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('WATER+')
    } else if (typePokemon1 === 'water' && (typePokemon2 === 'electric' || typePokemon2 === 'grass')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('WATER-')
    }

    if (typePokemon1 === 'fire' && (typePokemon2 === 'grass' || typePokemon2 === 'bug' || typePokemon2 === 'ice')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('FIRE+')
    } else if (typePokemon1 === 'fire' && (typePokemon2 === 'rock' || typePokemon2 === 'ground' || typePokemon2 === 'water')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('FIRE-')
    }
    
    if (typePokemon1 === 'grass' && (typePokemon2 === 'ground' || typePokemon2 === 'water' || typePokemon2 === 'rock')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('GRASS+')
    } else if (typePokemon1 === 'grass' && (typePokemon2 === 'bug' || typePokemon2 === 'fire' || typePokemon2 === 'ice')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('GRASS-')
    }

    if (typePokemon1 === 'electric' && typePokemon2 === 'water') {
        pokemon1Advantage = pokemon1Force + 40
        console.log('ELECTRIC+')
    } else if (typePokemon1 === 'electric' && typePokemon2 === 'ground') {
        pokemon1Advantage = pokemon1Force - 40
        console.log('ELECTRIC-')
    }

    if (typePokemon1 === 'ice' && (typePokemon2 === 'dragon' || typePokemon2 === 'grass' || typePokemon2 === 'ground')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('ICE+')
    } else if (typePokemon1 === 'ice' && (typePokemon2 === 'fighting' || typePokemon2 === 'fire' || typePokemon2 === 'rock')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('ICE-')
    }   

    if (typePokemon1 === 'rock' && (typePokemon2 === 'bug' || typePokemon2 === 'fire' || typePokemon2 === 'electric')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('ROCK+')
    } else if (typePokemon1 === 'rock' && (typePokemon2 === 'fighting' || typePokemon2 === 'grass' || typePokemon2 === 'water')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('ROCK-')
    }   

    if (typePokemon1 === 'ground' && (typePokemon2 === 'electric' || typePokemon2 === 'fire' || typePokemon2 === 'rock')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('GROUND+')
    } else if (typePokemon1 === 'ground' && (typePokemon2 === 'ice' || typePokemon2 === 'grass' || typePokemon2 === 'water')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('GROUND-')
    }   

    if (typePokemon1 === 'fighting' && (typePokemon2 === 'ice' || typePokemon2 === 'normal' || typePokemon2 === 'rock')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('FIGHTING+')
    } else if (typePokemon1 === 'fighting' && (typePokemon2 === 'fairy' || typePokemon2 === 'psychic')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('FIGHTING-')
    }   

    if (typePokemon1 === 'psychic' && (typePokemon2 === 'poison' || typePokemon2 === 'fighting')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('PSYCHIC+')
    } else if (typePokemon1 === 'psychic' && (typePokemon2 === 'bug' || typePokemon2 === 'ghost')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('PSYCHIC-')
    }   

    if (typePokemon1 === 'poison' && (typePokemon2 === 'fairy' || typePokemon2 === 'grass')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('POISON+')
    } else if (typePokemon1 === 'poison' && (typePokemon2 === 'ground' || typePokemon2 === 'psychic')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('POISON-')
    }   

    if (typePokemon1 === 'bug' && (typePokemon2 === 'psychic' || typePokemon2 === 'grass')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('BUG+')
    } else if (typePokemon1 === 'bug' && (typePokemon2 === 'fire' || typePokemon2 === 'rock')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('BUG-')
    }   

    if (typePokemon1 === 'fairy' && (typePokemon2 === 'dragon' || typePokemon2 === 'fighting')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('FAIRY+')
    } else if (typePokemon1 === 'fairy' && typePokemon2 === 'ghost') {
        pokemon1Advantage = pokemon1Force - 40
        console.log('FAIRY-')
    }   

    if (typePokemon1 === 'ghost' && (typePokemon2 === 'psychic' || typePokemon2 === 'ghost' || typePokemon2 === 'fighting')) {
        pokemon1Advantage = pokemon1Force + 40
        console.log('GHOST+')
    } 

    if (typePokemon1 === 'dragon' && (typePokemon2 === 'fairy' || typePokemon2 === 'ice')) {
        pokemon1Advantage = pokemon1Force - 40
        console.log('DRAGON-')
    }


    console.log(pokemon1Advantage)
    console.log(pokemon2Advantage)

    


 
    if (pokemon1Advantage > pokemon2Advantage) {  

        setTimeout(function() {document.querySelector('.life2').style.width = '80%'}, 200)
        setTimeout(function() {document.querySelector('.life2').style.width = '50%'}, 500)
        setTimeout(function() {document.querySelector('.life2').style.width = '20%'}, 800)
        setTimeout(function() {document.querySelector('.life1').style.width = '60%'}, 800)
        
        setTimeout(function() {element2.innerHTML = `<img class='smokePok2' src='../../assets/img/smoke1.png'>`}, 1200)
        setTimeout(function() {element2.innerHTML = `<img class='smokePok2' src='../../assets/img/smoke2.png'>`}, 1600)
        setTimeout(function() {element2.innerHTML = `<img class='smokePok2' src='../../assets/img/smoke3.png'>`}, 2000)

        setTimeout(function() {element2.innerHTML = 
            `
            <marquee direction="right" behavior="alternate" class="winnerMensage">
                ${namePok1} win!
            </marquee>
            `

            document.querySelector('.imageFront .dataPok').style.display = 'none'

        }, 2400)
    
    } else {

        setTimeout(function() {document.querySelector('.life1').style.width = '80%'}, 200)
        setTimeout(function() {document.querySelector('.life1').style.width = '50%'}, 500)
        setTimeout(function() {document.querySelector('.life1').style.width = '20%'}, 800)
        setTimeout(function() {document.querySelector('.life2').style.width = '60%'}, 800)

        setTimeout(function() {element1.innerHTML = `<img class='smokePok1' src='../../assets/img/smoke1.png'>`}, 1200)
        setTimeout(function() {element1.innerHTML = `<img class='smokePok1' src='../../assets/img/smoke2.png'>`}, 1600)
        setTimeout(function() {element1.innerHTML = `<img class='smokePok1' src='../../assets/img/smoke3.png'>`}, 2000)

        setTimeout(function() {element1.innerHTML = 
            `
            <marquee direction="right" behavior="alternate" class="winnerMensage">
                ${namePok2} win!
            </marquee>
            `
            document.querySelector('.imageBack .dataPok2').style.display = 'none'  

        }, 2400)

    }
}

