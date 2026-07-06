const battleState = {
    player: null,
    opponent: null,
    started: false,
    finished: false,
    currentTurn: null
}

const renderTimers = {
    player: [],
    opponent: []
}

const pokemonSides = {
    player: {
        inputId: 'input',
        containerId: 'halfScreen',
        pokemonId: 'pokemon1',
        dataNameAttr: 'data-name1',
        dataForceAttr: 'data-force',
        dataTypeAttr: 'data-type',
        dataClass: 'dataPok',
        imageClass: 'imageFront',
        lifeClass: 'life1',
        spriteKey: 'front',
        entryFrames: [
            { delay: 0, className: 'ballCome', image: 1 },
            { delay: 50, className: 'ballCome2', image: 1 },
            { delay: 300, className: 'openBall', image: 1 },
            { delay: 900, className: 'openBall', image: 2 },
            { delay: 1200, className: 'openBall', image: 3 },
            { delay: 1500, className: 'openBall', image: 4 }
        ],
        smokeClass: 'smokePok1'
    },
    opponent: {
        inputId: 'input2',
        containerId: 'halfScreen2',
        pokemonId: 'pokemon2',
        dataNameAttr: 'data-name2',
        dataForceAttr: 'data-force2',
        dataTypeAttr: 'data-type2',
        dataClass: 'dataPok2',
        imageClass: 'imageBack',
        lifeClass: 'life2',
        spriteKey: 'back',
        entryFrames: [
            { delay: 0, className: 'ballComePok2', image: 1 },
            { delay: 50, className: 'ballComePok2-2', image: 1 },
            { delay: 300, className: 'openBall2', image: 1 },
            { delay: 900, className: 'openBall2', image: 2 },
            { delay: 1200, className: 'openBall2', image: 3 },
            { delay: 1500, className: 'openBall2', image: 4 }
        ],
        smokeClass: 'smokePok2'
    }
}

const search = () => {
    loadPokemon('player')
}

const search2 = () => {
    loadPokemon('opponent')
}

const fight = () => {
    if (!battleState.started || battleState.finished) {
        startBattle()
        return
    }

    executeTurn()
}

const loadPokemon = async (side) => {
    const settings = pokemonSides[side]
    const input = document.getElementById(settings.inputId)
    const pokName = input.value.trim()

    if (!pokName) {
        showMessage('Enter a Pokemon name or number!')
        return
    }

    try {
        battleState[side] = null
        resetBattle()
        clearSideTimers(side)
        clearMessage()

        const data = await getPokemon(pokName)
        const pokemon = normalizePokemon(data)

        battleState[side] = pokemon
        renderPokemon(pokemon, side)
        console.log(data)
    } catch (err) {
        battleState[side] = null
        resetBattle()
        clearSideTimers(side)
        document.getElementById(settings.containerId).innerHTML = ''
        showMessage('Pokemon not found!')
        console.log(err)
    }
}

const getPokemon = async (pokName) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokName.toLowerCase()}/`
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error('Pokemon not found')
    }

    return response.json()
}

const normalizePokemon = (data) => {
    const stats = normalizeStats(data.stats)

    return {
        id: data.id,
        name: capitalize(data.name),
        weightKg: (data.weight / 2.205).toFixed(0),
        force: calculateBattlePower(stats),
        maxHp: stats.hp,
        currentHp: stats.hp,
        type: data.types[0].type.name,
        sprites: {
            front: data.sprites.front_default,
            back: data.sprites.back_default || data.sprites.front_default
        },
        stats,
        ready: false
    }
}

const renderPokemon = (pokemon, side) => {
    const settings = pokemonSides[side]
    const container = document.getElementById(settings.containerId)

    document.querySelector('#powerId').style.color = 'rgb(121, 255, 121)'
    document.querySelector('#textScreen').style.display = 'none'
    document.querySelector('#ball').style.display = 'none'

    settings.entryFrames.forEach((frame) => {
        scheduleRender(side, frame.delay, () => {
            container.innerHTML = `<img class='${frame.className}' src='${getBallImage(frame.image)}'>`
        })
    })

    scheduleRender(side, 1800, () => {
        container.innerHTML = getPokemonMarkup(pokemon, settings)
        pokemon.ready = true
    })
}

const getPokemonMarkup = (pokemon, settings) => {
    return `
        <div id='${settings.pokemonId}' class='pokemonBattleCard' ${settings.dataNameAttr}='${pokemon.name}' ${settings.dataForceAttr}='${pokemon.force}' ${settings.dataTypeAttr}='${pokemon.type}'>
            <div class='${settings.dataClass}'>
                <h2><span class='turnArrow'></span>${pokemon.name}</h2>
                <div class='lifeBar'><div class='${settings.lifeClass}'></div></div>
                <p class='hpText'>HP: ${pokemon.currentHp}/${pokemon.maxHp}</p>
                <p>No: ${pokemon.id}</p>
                <p>Type: ${pokemon.type}</p>
            </div>
            <img class='${settings.imageClass}' src='${pokemon.sprites[settings.spriteKey]}'>
        </div>
    `
}

const normalizeStats = (apiStats) => {
    const stats = apiStats.reduce((acc, item) => {
        acc[item.stat.name] = item.base_stat
        return acc
    }, {})

    return {
        hp: stats.hp || 0,
        attack: stats.attack || 0,
        defense: stats.defense || 0,
        specialAttack: stats['special-attack'] || 0,
        specialDefense: stats['special-defense'] || 0,
        speed: stats.speed || 0
    }
}

const calculateBattlePower = (stats) => {
    return stats.hp
        + stats.attack
        + stats.defense
        + stats.specialAttack
        + stats.specialDefense
        + stats.speed
}

const startBattle = () => {
    const pokemon1 = battleState.player
    const pokemon2 = battleState.opponent

    if (!pokemon1 || !pokemon2 || !pokemon1.ready || !pokemon2.ready) {
        showMessage('Choose two Pokemon before battle!')
        return
    }

    pokemon1.currentHp = pokemon1.maxHp
    pokemon2.currentHp = pokemon2.maxHp
    battleState.started = true
    battleState.finished = false
    battleState.currentTurn = chooseFirstTurn(pokemon1, pokemon2)

    clearMessage()
    clearBattleLog()
    setBattleButton('ATTACK', false)
    updateHpBar('player')
    updateHpBar('opponent')
    updateTurnIndicator()

    addBattleLog('A batalha começou!')
    addBattleLog(getFirstTurnMessage())
}

const executeTurn = () => {
    if (!battleState.started || battleState.finished) {
        return
    }

    const attackerSide = battleState.currentTurn
    const defenderSide = getOpponentSide(attackerSide)
    const attacker = battleState[attackerSide]
    const defender = battleState[defenderSide]
    const damage = calculateDamage(attacker, defender)

    defender.currentHp = Math.max(defender.currentHp - damage, 0)
    updateHpBar(defenderSide)

    addBattleLog(`${attacker.name} atacou ${defender.name}!`)
    addBattleLog(`${defender.name} perdeu ${damage} HP.`)

    if (defender.currentHp === 0) {
        addBattleLog(`${defender.name} foi derrotado!`)
        finishBattle(attackerSide)
        return
    }

    battleState.currentTurn = defenderSide
    updateTurnIndicator()
}

const calculateDamage = (attacker, defender) => {
    const rawDamage = attacker.stats.attack - Math.floor(defender.stats.defense / 2)
    return Math.max(rawDamage, 5)
}

const updateHpBar = (side) => {
    const pokemon = battleState[side]
    const settings = pokemonSides[side]
    const pokemonElement = document.getElementById(settings.pokemonId)
    const lifeBar = pokemonElement && pokemonElement.querySelector(`.${settings.lifeClass}`)
    const hpText = pokemonElement && pokemonElement.querySelector('.hpText')

    if (!pokemon || !pokemonElement || !lifeBar || !hpText) {
        return
    }

    const hpPercent = Math.max((pokemon.currentHp / pokemon.maxHp) * 100, 0)

    lifeBar.style.width = `${hpPercent}%`
    hpText.textContent = `HP: ${pokemon.currentHp}/${pokemon.maxHp}`
}

const updateTurnIndicator = () => {
    const turnInfo = document.getElementById('turnInfo')
    const currentPokemon = battleState[battleState.currentTurn]

    Object.keys(pokemonSides).forEach((side) => {
        const pokemonElement = document.getElementById(pokemonSides[side].pokemonId)

        if (pokemonElement) {
            pokemonElement.classList.toggle('activeTurn', side === battleState.currentTurn && !battleState.finished)
        }
    })

    if (turnInfo) {
        turnInfo.textContent = currentPokemon && !battleState.finished
            ? `Vez de: ${currentPokemon.name}`
            : ''
    }
}

const addBattleLog = (message) => {
    const battleLog = document.getElementById('battleLog')

    if (!battleLog) {
        return
    }

    battleLog.innerHTML += `<p>${message}</p>`
    battleLog.scrollTop = battleLog.scrollHeight
}

const finishBattle = (winnerSide) => {
    const winner = battleState[winnerSide]
    const loserSide = getOpponentSide(winnerSide)

    battleState.finished = true
    battleState.currentTurn = null
    updateTurnIndicator()
    addBattleLog(`${winner.name} venceu a batalha!`)
    animateDefeat(loserSide, winner.name)
    setBattleButton('BATTLE OVER', true)
}

const animateDefeat = (loserSide, winnerName) => {
    const settings = pokemonSides[loserSide]
    const container = document.getElementById(settings.containerId)

    if (!container) {
        return
    }

    const smokeImages = [1, 2, 3]

    smokeImages.forEach((image, index) => {
        setTimeout(() => {
            container.innerHTML = `<img class='${settings.smokeClass}' src='../../assets/img/smoke${image}.png'>`
        }, 400 + index * 400)
    })

    setTimeout(() => {
        container.innerHTML = `
            <marquee direction="right" behavior="alternate" class="winnerMensage">
                ${winnerName} win!
            </marquee>
        `
    }, 1700)
}

const chooseFirstTurn = (pokemon1, pokemon2) => {
    if (pokemon1.stats.speed > pokemon2.stats.speed) {
        return 'player'
    }

    if (pokemon2.stats.speed > pokemon1.stats.speed) {
        return 'opponent'
    }

    return Math.random() < 0.5 ? 'player' : 'opponent'
}

const getFirstTurnMessage = () => {
    const currentPokemon = battleState[battleState.currentTurn]
    const opponentPokemon = battleState[getOpponentSide(battleState.currentTurn)]

    if (currentPokemon.stats.speed === opponentPokemon.stats.speed) {
        return `${currentPokemon.name} começa por sorte no empate de velocidade!`
    }

    return `${currentPokemon.name} começa por ser mais rápido!`
}

const getOpponentSide = (side) => {
    return side === 'player' ? 'opponent' : 'player'
}

const resetBattle = () => {
    battleState.started = false
    battleState.finished = false
    battleState.currentTurn = null
    setBattleButton('TO BATTLE', false)
    clearBattleLog()
    updateTurnIndicator()
}

const clearBattleLog = () => {
    const battleLog = document.getElementById('battleLog')
    const turnInfo = document.getElementById('turnInfo')

    if (battleLog) {
        battleLog.innerHTML = ''
    }

    if (turnInfo) {
        turnInfo.textContent = ''
    }
}

const setBattleButton = (text, disabled) => {
    const button = document.querySelector('.toBattle')

    if (button) {
        button.textContent = text
        button.disabled = disabled
    }
}

const scheduleRender = (side, delay, callback) => {
    const timer = setTimeout(callback, delay)
    renderTimers[side].push(timer)
}

const clearSideTimers = (side) => {
    renderTimers[side].forEach((timer) => clearTimeout(timer))
    renderTimers[side] = []
}

const clearMessage = () => {
    document.getElementById('winner').innerHTML = ''
}

const showMessage = (message) => {
    document.getElementById('winner').innerHTML = `
        <marquee direction="right" behavior="alternate" class="winnerMensage">
            ${message}
        </marquee>
    `
}

const getBallImage = (image) => {
    return `../../assets/img/ballOpen${image}.png`
}

const capitalize = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}
