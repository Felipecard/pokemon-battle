const battleState = {
    player: null,
    opponent: null,
    playerTeam: [],
    machineTeam: [],
    playerActiveIndex: 0,
    machineActiveIndex: 0,
    started: false,
    finished: false,
    currentTurn: null,
    selectingMachine: false,
    machineThinking: false,
    waitingForPlayerSwitch: false,
    aiDifficulty: 'medium',
    muted: false,
    resetToken: 0
}

const aiDifficultyLabels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
}

const teamDifficultyProfiles = {
    easy: {
        label: 'weaker',
        firstRange: [0.55, 0.9],
        secondRange: [0.45, 1],
        targetMultiplier: 0.75
    },
    medium: {
        label: 'balanced',
        firstRange: [0.85, 1.15],
        secondRange: [0.75, 1.25],
        targetMultiplier: 1
    },
    hard: {
        label: 'stronger',
        firstRange: [1.1, 1.55],
        secondRange: [1, 1.75],
        targetMultiplier: 1.35
    }
}

const journeyState = {
    isJourneyMode: true,
    currentTrainerIndex: 0,
    completedTrainers: [],
    continueUsed: 0,
    maxContinues: 2,
    potionsUsed: 0,
    maxPotions: 3,
    phase: 'setup',
    result: null,
    trainers: [
        {
            name: 'Mariner',
            difficulty: 'easy',
            theme: 'water',
            challengeText: 'The waves always reveal who is ready to fight.',
            defeatText: 'You sailed better than I expected.',
            image: '../../assets/img/trainer_mariner.png',
            face: '../../assets/img/face-mariner.png',
            index: 0
        },
        {
            name: 'Uiryhs',
            difficulty: 'easy',
            theme: 'storm',
            challengeText: 'The Dragon and my old master are leading the way. I want to see if you can keep up.',
            defeatText: 'You endured the storm.',
            image: '../../assets/img/trainer_gale.png',
            face: '../../assets/img/face-gale.png',
            index: 1
        },
        {
            name: 'Orochi',
            difficulty: 'medium',
            theme: 'shadow',
            challengeText: 'The fear of death is a human weakness... Let me show you the true value of eternal power.',
            defeatText: 'You passed my test.',
            image: '../../assets/img/maru.png',
            face: '../../assets/img/face-maru.png',
            index: 2
        },
        {
            name: 'Fisherman',
            difficulty: 'medium',
            theme: 'river',
            challengeText: 'Fishing requires patience. So does battle.',
            defeatText: 'You reeled in a great victory.',
            image: '../../assets/img/fisherman.png',
            face: '../../assets/img/face-fisherman.png',
            index: 3
        },
        {
            name: 'Sword Lord',
            difficulty: 'hard',
            theme: 'blade',
            challengeText: 'A blade recognizes only those who fight with honor.',
            defeatText: 'Your courage cut through even the silence.',
            image: '../../assets/img/swordlord.png',
            face: '../../assets/img/face-lordsword.png',
            index: 4
        },
        {
            name: 'Old Gary',
            difficulty: 'hard',
            theme: 'champion',
            challengeText: 'Hello old friend, you have come a long way. Now prove you deserve the top.',
            defeatText: 'Hmph... not bad. Maybe you really are a champion.',
            image: '../../assets/img/ond-gary.png',
            face: '../../assets/img/face-gary.png',
            index: 5
        }
    ]
}

const pokemonApiCache = {}
const moveDetailsCache = {}
const pokemonCandidateCache = {}
const teamSize = 3
const maxMachinePokemonId = 251

const sounds = {
    start: new Audio('../../assets/sounds/start.mp3'),
    choose: new Audio('../../assets/sounds/choose.mp3'),
    attack: new Audio('../../assets/sounds/choose_atack.mp3'),
    failAttack: new Audio('../../assets/sounds/fail-atack.mp3'),
    glug: new Audio('../../assets/sounds/glug.mp3'),
    cry: new Audio('../../assets/sounds/cry.mp3'),
    deathPok: new Audio('../../assets/sounds/death-pok.mp3'),
    pokeballOpen: new Audio('../../assets/sounds/throw-pokeball.mp3'),
    songBattle: new Audio('../../assets/sounds/song-battle.mp3'),
    finishGame: new Audio('../../assets/sounds/finish-game-congrats.mp3'),
    xEnter: new Audio('../../assets/sounds/x-enter.mp3'),
    lose: new Audio('../../assets/sounds/lost-battle.mp3'),
    win: new Audio('../../assets/sounds/victory.mp3')
}

const renderTimers = {
    player: [],
    opponent: []
}
const battleTimers = []

const pokemonSides = {
    player: {
        inputId: 'input',
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
    },
    opponent: {
        inputId: 'input2',
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
    }
}

const search = (slotIndex = getFirstEmptyTeamSlot()) => {
    if (battleState.selectingMachine) {
        return
    }

    addPokemonToPlayerTeam(slotIndex)
}

const search2 = () => {
    loadPokemon('opponent')
}

const fight = () => {
    if (battleState.finished) {
        handleJourneyButtonAction()
        return
    }

    if (journeyState.phase === 'trainerIntro') {
        startTrainerBattle()
        return
    }

    if (!battleState.started) {
        loadTrainerBattle(journeyState.currentTrainerIndex)
        return
    }

    addBattleLog('Choose a move to attack.', 'error')
}

const addPokemonToPlayerTeam = async (slotIndex) => {
    const input = document.getElementById(getTeamSlotInputId(slotIndex))
    const resetToken = battleState.resetToken

    if (!input) {
        return
    }

    const pokName = input.value.trim()

    if (battleState.started || battleState.playerTeam[slotIndex] || battleState.selectingMachine) {
        return
    }

    if (!pokName) {
        showMessage('Enter a Pokemon name or number!', 'error')
        return
    }

    try {
        setSearchControls(true)
        clearMessage()
        const data = await getPokemon(pokName)
        const pokemon = normalizePokemon(data, [getFallbackMove()], false)

        if (resetToken !== battleState.resetToken) {
            setSearchControls(false)
            return
        }

        battleState.playerTeam[slotIndex] = pokemon
        playSound('choose')
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog(`${pokemon.name} joined slot ${slotIndex + 1}!`, 'success')
        setSearchControls(false)

        loadPlayerPokemonMoves(pokemon, data.moves, slotIndex, resetToken)
    } catch (err) {
        showMessage('Pokemon not found!', 'error')
        console.log(err)
        setSearchControls(false)
    }
}

const loadPlayerPokemonMoves = async (pokemon, rawMoves, slotIndex, resetToken) => {
    try {
        const moves = await getPokemonMoves(rawMoves)

        if (resetToken !== battleState.resetToken || battleState.playerTeam[slotIndex] !== pokemon) {
            return
        }

        pokemon.moves = moves
        pokemon.ready = true
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog(`${pokemon.name} is ready to battle!`, 'success')
    } catch (err) {
        if (resetToken !== battleState.resetToken || battleState.playerTeam[slotIndex] !== pokemon) {
            return
        }

        pokemon.moves = [getFallbackMove()]
        pokemon.ready = true
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog(`${pokemon.name} will use basic moves in this battle.`, 'info')
        console.log(err)
    }
}

const removePokemonFromPlayerTeam = (index) => {
    if (battleState.started || battleState.selectingMachine) {
        return
    }

    battleState.playerTeam[index] = null
    renderPlayerTeamSlots()
    renderTeamSummary()
    updateStartButton()
}

const renderPlayerTeamSlots = () => {
    const slots = document.getElementById('playerTeamSlots')

    if (!slots) {
        return
    }

    slots.innerHTML = getTeamSlotIndexes().map((index) => {
        const pokemon = battleState.playerTeam[index]

        if (!pokemon) {
            return `
                <div class="teamSlot teamSlotEmpty">
                    <span>Slot ${index + 1}</span>
                    <div class="teamSlotForm">
                        <input class="teamSlotInput" id="${getTeamSlotInputId(index)}" type="text" placeholder="Pok name or number" onkeydown="handleTeamSlotKey(event, ${index})">
                        <button class="teamSlotAdd" onclick="search(${index})">ADD</button>
                    </div>
                </div>
            `
        }

        return `
            <div class="teamSlot">
                <span>${pokemon.name}${pokemon.ready ? '' : ' <small class="teamSlotLoading">loading...</small>'}</span>
                <button class="teamSlotRemove" onclick="removePokemonFromPlayerTeam(${index})">X</button>
            </div>
        `
    }).join('')
}

const updateStartButton = () => {
    const button = document.querySelector('.toBattle')

    if (button && !battleState.started) {
        button.disabled = !isPlayerTeamComplete() || battleState.selectingMachine
    }
}

const getTeamSlotIndexes = () => {
    return Array.from({ length: teamSize }, (_, index) => index)
}

const getTeamSlotInputId = (slotIndex) => {
    return `teamSlotInput${slotIndex}`
}

const getFirstEmptyTeamSlot = () => {
    return getTeamSlotIndexes().find((index) => !battleState.playerTeam[index])
}

const isPlayerTeamComplete = () => {
    return getTeamSlotIndexes().every((index) => {
        const pokemon = battleState.playerTeam[index]
        return pokemon && pokemon.ready
    })
}

const handleTeamSlotKey = (event, slotIndex) => {
    if (event.key === 'Enter') {
        search(slotIndex)
    }
}

const chooseRandomPlayerTeam = async () => {
    if (battleState.started || battleState.selectingMachine) {
        return
    }

    const resetToken = battleState.resetToken

    try {
        setSearchControls(true)
        setRandomTeamButton(true)
        clearMessage()
        clearBattleLog()

        const randomIds = getUniqueRandomPokemonIds(teamSize)
        const pokemonData = await Promise.all(randomIds.map(async (pokemonId) => {
            const data = await getPokemon(pokemonId.toString())

            return data
        }))

        if (resetToken !== battleState.resetToken) {
            setSearchControls(false)
            setRandomTeamButton(false)
            return
        }

        battleState.playerTeam = pokemonData.map((data) => normalizePokemon(data, [getFallbackMove()], false))
        battleState.machineTeam = []
        playSound('choose')
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog('Your random team was chosen!', 'success')
        setSearchControls(false)
        setRandomTeamButton(false)

        pokemonData.forEach((data, index) => {
            loadPlayerPokemonMoves(battleState.playerTeam[index], data.moves, index, resetToken)
        })
    } catch (err) {
        showMessage('Could not choose a random team!', 'error')
        console.log(err)
        setSearchControls(false)
        setRandomTeamButton(false)
    }
}

const getUniqueRandomPokemonIds = (amount) => {
    const ids = new Set()

    while (ids.size < amount) {
        ids.add(getRandomPokemonId())
    }

    return [...ids]
}

const loadPokemon = async (side) => {
    const settings = pokemonSides[side]
    const input = document.getElementById(settings.inputId)
    const pokName = input.value.trim()

    if (!pokName) {
        showMessage('Enter a Pokemon name or number!', 'error')
        return
    }

    try {
        battleState[side] = null
        resetBattle()
        clearSideTimers(side)
        clearMoveButtons()
        clearMessage()

        if (side === 'player') {
            setSearchControls(true)
        }

        const data = await getPokemon(pokName)
        const moves = await getPokemonMoves(data.moves)
        const pokemon = normalizePokemon(data, moves)

        battleState[side] = pokemon
        renderPokemon(pokemon, side)

        if (side === 'player') {
            playSound('choose')
            await wait(2000)
            await selectMachinePokemon(pokemon)
        }

        console.log(data)
    } catch (err) {
        battleState[side] = null
        battleState.selectingMachine = false
        resetBattle()
        clearSideTimers(side)
        document.getElementById(settings.containerId).innerHTML = ''
        showMessage('Pokemon not found!', 'error')
        setSearchControls(false)
        console.log(err)
    }
}

const getPokemon = async (pokName) => {
    const pokemonKey = pokName.toString().toLowerCase()

    if (pokemonApiCache[pokemonKey]) {
        return pokemonApiCache[pokemonKey]
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonKey}/`
    const pokemonRequest = fetch(url)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error('Pokemon not found')
            }

            const data = await response.json()
            pokemonApiCache[pokemonKey] = data
            pokemonApiCache[data.id.toString()] = data
            pokemonApiCache[data.name.toLowerCase()] = data

            return data
        })
        .catch((err) => {
            delete pokemonApiCache[pokemonKey]
            throw err
        })

    pokemonApiCache[pokemonKey] = pokemonRequest

    return pokemonRequest
}

const getPokemonMoves = async (pokemonMoves) => {
    const movePool = []
    const batchSize = 12
    const maxMoves = 24
    const shuffledMoves = shuffleList(pokemonMoves)

    for (let i = 0; i < shuffledMoves.length && movePool.length < maxMoves; i += batchSize) {
        const moveBatch = shuffledMoves.slice(i, i + batchSize)
        const moveRequests = moveBatch.map((item) => getMoveDetails(item.move.url))
        const results = await Promise.allSettled(moveRequests)

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                movePool.push(result.value)
            }
        })
    }

    return movePool.length ? movePool : [getFallbackMove()]
}

const getMoveDetails = async (url) => {
    if (moveDetailsCache[url]) {
        return moveDetailsCache[url]
    }

    const moveRequest = fetch(url)
        .then(async (response) => {
            if (!response.ok) {
                return null
            }

            const data = await response.json()

            return {
                name: data.name,
                displayName: formatMoveName(data.name),
                type: data.type.name,
                displayType: capitalize(data.type.name),
                power: data.power || 0,
                accuracy: data.accuracy ?? 100,
                damageClass: data.damage_class ? data.damage_class.name : '',
                pp: data.pp
            }
        })
        .catch((err) => {
            console.log(err)
            return null
        })

    moveDetailsCache[url] = moveRequest

    return moveRequest
}

const getFallbackMove = () => {
    return {
        name: 'tackle',
        displayName: 'Tackle',
        type: 'normal',
        displayType: 'Normal',
        power: 40,
        accuracy: 100,
        damageClass: 'physical',
        pp: null
    }
}

const getRandomMoves = (moves, amount) => {
    const selectedMoves = shuffleList(moves).slice(0, amount)

    while (selectedMoves.length < amount) {
        selectedMoves.push(getFallbackMove())
    }

    return selectedMoves
}

const getPlayerTurnMoves = (pokemon) => {
    const moves = pokemon.moves && pokemon.moves.length ? pokemon.moves : [getFallbackMove()]
    return shuffleList(moves).slice(0, 4)
}

const getMachineTurnMoves = (pokemon) => {
    const moves = pokemon.moves && pokemon.moves.length ? pokemon.moves : [getFallbackMove()]
    const selectedMoves = shuffleList(moves).slice(0, 4)

    return selectedMoves.length ? selectedMoves : [getFallbackMove()]
}

const shuffleList = (list) => {
    return [...list].sort(() => Math.random() - 0.5)
}

const getRandomItem = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const normalizePokemon = (data, moves, ready = true) => {
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
        moves,
        stats,
        ready
    }
}

const renderPokemon = (pokemon, side) => {
    const settings = pokemonSides[side]
    const container = document.getElementById(settings.containerId)

    clearSideTimers(side)
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

const calculatePokemonPower = (pokemon) => {
    return pokemon.stats.hp
        + pokemon.stats.attack
        + pokemon.stats.defense
        + pokemon.stats.speed
}

const selectMachinePokemon = async (playerPokemon) => {
    battleState.selectingMachine = true
    battleState.opponent = null
    clearSideTimers('opponent')
    document.getElementById(pokemonSides.opponent.containerId).innerHTML = ''
    addBattleLog('The machine is choosing a balanced opponent...')
    addBattleLog('Analyzing candidates...')

    try {
        const machinePokemon = await getBalancedMachinePokemon(playerPokemon)
        const moves = await getPokemonMoves(machinePokemon.rawMoves)
        const opponent = {
            ...machinePokemon,
            moves,
            ready: true
        }

        battleState.opponent = opponent
        renderPokemon(opponent, 'opponent')
        addBattleLog(`The machine chose ${opponent.name}!`)
    } catch (err) {
        console.log(err)
        const fallback = await getFallbackMachinePokemon(playerPokemon)

        battleState.opponent = fallback
        renderPokemon(fallback, 'opponent')
        addBattleLog(`The machine chose ${fallback.name}!`)
    } finally {
        battleState.selectingMachine = false
        setSearchControls(false)
    }
}

const generateMachineTeam = async (playerTeam) => {
    const trainerName = getOpponentTrainerName()

    battleState.selectingMachine = true
    battleState.machineTeam = []
    updateStartButton()
    addBattleLog('You built your team!', 'success')
    addBattleLog(`${trainerName} is building a ${getTeamDifficultyProfile().label} team...`)

    const excludedIds = new Set(playerTeam.filter(Boolean).map((pokemon) => pokemon.id))

    try {
        for (const playerPokemon of playerTeam) {
            let machinePokemon

            try {
                machinePokemon = await getBalancedMachinePokemon(playerPokemon, excludedIds)
            } catch (err) {
                console.log(err)
                machinePokemon = await getFallbackMachinePokemon(playerPokemon, excludedIds)
            }

            const moves = machinePokemon.moves && machinePokemon.moves.length
                ? machinePokemon.moves
                : await getPokemonMoves(machinePokemon.rawMoves)
            const opponent = {
                ...machinePokemon,
                currentHp: machinePokemon.maxHp,
                defeated: false,
                moves,
                ready: true
            }

            excludedIds.add(opponent.id)
            battleState.machineTeam.push(opponent)
            addBattleLog(`${trainerName} added ${opponent.name} to the team.`)
        }

        addBattleLog(`${trainerName} chose a team!`, 'success')
    } finally {
        battleState.selectingMachine = false
        updateStartButton()
    }
}

const getBalancedMachinePokemon = async (playerPokemon, excludedIds = new Set()) => {
    const playerPower = calculatePokemonPower(playerPokemon)
    const profile = getTeamDifficultyProfile()
    const firstCandidates = await getCandidateSample(playerPokemon, 10, excludedIds)
    let validCandidates = findCandidatesInPowerRange(firstCandidates, playerPower, profile.firstRange[0], profile.firstRange[1])

    if (validCandidates.length) {
        return getRandomItem(validCandidates)
    }

    addBattleLog('Searching for more candidates...')

    const secondCandidates = await getCandidateSample(playerPokemon, 10, excludedIds)
    const allCandidates = [...firstCandidates, ...secondCandidates]
    validCandidates = findCandidatesInPowerRange(allCandidates, playerPower, profile.secondRange[0], profile.secondRange[1])

    if (validCandidates.length) {
        return getRandomItem(validCandidates)
    }

    const closestCandidate = findClosestCandidate(allCandidates, playerPower * profile.targetMultiplier)

    if (!closestCandidate) {
        throw new Error('Machine could not find a candidate')
    }

    return closestCandidate
}

const getCandidateSample = async (playerPokemon, amount, excludedIds = new Set()) => {
    const candidates = []
    const candidateRequests = []
    const usedIds = new Set([...excludedIds, playerPokemon.id])

    while (candidateRequests.length < amount) {
        const pokemonId = getRandomPokemonId()

        if (!usedIds.has(pokemonId)) {
            usedIds.add(pokemonId)
            candidateRequests.push(getRandomPokemonCandidate(pokemonId))
        }
    }

    const results = await Promise.allSettled(candidateRequests)

    results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
            candidates.push(result.value)
        }
    })

    return candidates
}

const getRandomPokemonId = () => {
    return Math.floor(Math.random() * maxMachinePokemonId) + 1
}

const getRandomPokemonCandidate = async (pokemonId) => {
    if (pokemonCandidateCache[pokemonId]) {
        return pokemonCandidateCache[pokemonId]
    }

    try {
        const data = await getPokemon(pokemonId.toString())
        const pokemon = normalizePokemon(data, [])
        const candidate = {
            ...pokemon,
            totalPower: calculatePokemonPower(pokemon),
            rawMoves: data.moves
        }

        pokemonCandidateCache[pokemonId] = candidate
        return candidate
    } catch (err) {
        console.log(err)
        return null
    }
}

const findCandidatesInPowerRange = (candidates, playerPower, minMultiplier, maxMultiplier) => {
    const minPower = playerPower * minMultiplier
    const maxPower = playerPower * maxMultiplier

    return candidates.filter((candidate) => {
        return candidate.totalPower >= minPower && candidate.totalPower <= maxPower
    })
}

const getTeamDifficultyProfile = () => {
    return teamDifficultyProfiles[getAiDifficulty()] || teamDifficultyProfiles.medium
}

const findClosestCandidate = (candidates, targetPower) => {
    return candidates.reduce((closest, candidate) => {
        if (!closest) {
            return candidate
        }

        const currentDistance = Math.abs(candidate.totalPower - targetPower)
        const closestDistance = Math.abs(closest.totalPower - targetPower)

        return currentDistance < closestDistance ? candidate : closest
    }, null)
}

const getFallbackMachinePokemon = async (playerPokemon, excludedIds = new Set()) => {
    const fallbackOptions = [1, 4, 7].filter((id) => id !== playerPokemon.id && !excludedIds.has(id))
    const fallbackIds = fallbackOptions.length ? fallbackOptions : [1, 4, 7]
    const fallbackId = getRandomItem(fallbackIds)
    const data = await getPokemon(fallbackId.toString())
    const moves = await getPokemonMoves(data.moves)

    return {
        ...normalizePokemon(data, moves),
        rawMoves: data.moves
    }
}

const getCurrentTrainer = () => {
    return journeyState.trainers[journeyState.currentTrainerIndex]
}

const getOpponentTrainerName = () => {
    const trainer = getCurrentTrainer()
    return trainer ? trainer.name : 'The machine'
}

const loadTrainerBattle = async (trainerIndex) => {
    const trainer = journeyState.trainers[trainerIndex]

    if (!trainer) {
        showMessage('End of the journey demo.', 'success')
        setBattleButton('New Game', false, false)
        journeyState.phase = 'journeyComplete'
        return
    }

    if (battleState.selectingMachine) {
        showMessage(`${trainer.name} is choosing a team!`, 'info')
        return
    }

    if (!isPlayerTeamComplete()) {
        showMessage('Choose 3 Pokemon before battle!', 'error')
        return
    }

    journeyState.phase = 'preparing'
    journeyState.result = null
    battleState.resetToken += 1
    const resetToken = battleState.resetToken
    resetPokemonTeamForBattle(battleState.playerTeam)
    battleState.machineTeam = []
    battleState.player = null
    battleState.opponent = null
    battleState.started = false
    battleState.finished = false
    battleState.currentTurn = null
    battleState.machineThinking = false
    battleState.waitingForPlayerSwitch = false
    clearSideTimers('player')
    clearSideTimers('opponent')
    clearBattleTimers()
    clearMessage()
    clearBattleLog()
    clearMoveButtons()
    hideMachineMoveBubble()
    hidePlayerSwitchOptions()
    updateTeamDots('player')
    updateTeamDots('opponent')
    clearBattleScreen({ showIdleBall: false, showWelcome: false })
    setCurrentTrainerAiDifficulty()
    setSearchControls(true)
    setBattleButton('Preparing...', true, false)
    addBattleLog(`${trainer.name} is choosing a team...`)

    try {
        await generateMachineTeam(battleState.playerTeam)

        if (resetToken !== battleState.resetToken) {
            return
        }

        showTrainerIntro(trainer)
        setBattleMenuMode('trainerIntro')
        setBattleButton('Start 3x3 Battle', false, false)
        journeyState.phase = 'trainerIntro'
    } catch (err) {
        console.log(err)
        battleState.machineTeam = []
        showMessage(`${trainer.name} could not build a team. Try again!`, 'error')
        setBattleButton('START 3x3', false, false)
        journeyState.phase = 'setup'
    } finally {
        setSearchControls(false)
    }
}

const startTrainerBattle = () => {
    hideTrainerIntro()
    journeyState.phase = 'battle'
    startThreeVsThreeBattle()
}

const resetPokemonTeamForBattle = (team) => {
    team.forEach((pokemon) => {
        if (!pokemon) {
            return
        }

        pokemon.currentHp = pokemon.maxHp
        pokemon.defeated = false
        pokemon.ready = true
    })
}

const setCurrentTrainerAiDifficulty = () => {
    const trainer = getCurrentTrainer()

    setAiDifficulty(trainer ? trainer.difficulty : 'medium', true)
}

const startThreeVsThreeBattle = async () => {
    if (battleState.selectingMachine) {
        showMessage(`Wait for ${getOpponentTrainerName()} to choose its team!`, 'info')
        return
    }

    if (!isPlayerTeamComplete()) {
        showMessage('Choose 3 Pokemon before battle!', 'error')
        return
    }

    clearMessage()
    clearBattleLog()
    playSound('start')
    const resetToken = battleState.resetToken

    if (battleState.machineTeam.length !== 3) {
        setSearchControls(true)
        setBattleButton('START 3x3', true, false)
        try {
            await generateMachineTeam(battleState.playerTeam)

            if (resetToken !== battleState.resetToken) {
                return
            }
        } catch (err) {
            console.log(err)
            battleState.machineTeam = []
            showMessage(`${getOpponentTrainerName()} could not build a team. Try again!`, 'error')
            setBattleButton('START 3x3', false, false)
            return
        } finally {
            setSearchControls(false)
        }
    }

    const pokemon1 = battleState.playerTeam[0]
    const pokemon2 = battleState.machineTeam[0]

    if (battleState.selectingMachine) {
        showMessage(`Wait for ${getOpponentTrainerName()} to choose a Pokemon!`, 'info')
        return
    }

    if (battleState.machineTeam.length !== 3) {
        showMessage(`${getOpponentTrainerName()} could not build a team. Try again!`, 'error')
        setBattleButton('START 3x3', false, false)
        return
    }

    if (!pokemon1 || !pokemon2 || !pokemon1.ready || !pokemon2.ready) {
        showMessage('Choose 3 Pokemon before battle!', 'error')
        return
    }

    battleState.playerActiveIndex = 0
    battleState.machineActiveIndex = 0
    battleState.player = pokemon1
    battleState.opponent = pokemon2
    battleState.started = true
    battleState.finished = false
    battleState.waitingForPlayerSwitch = false
    battleState.currentTurn = chooseFirstTurn(pokemon1, pokemon2)

    setSearchControls(true)
    setBattleMenuMode('battle')
    setBattleButton('START 3x3', true, true)
    renderPokemon(pokemon2, 'opponent')
    await wait(1900)

    if (resetToken !== battleState.resetToken) {
        return
    }

    updateHpBar('opponent')
    addBattleLog(`${getOpponentTrainerName()} sent out ${pokemon2.name}!`)

    renderPokemon(pokemon1, 'player')
    await wait(1900)

    if (resetToken !== battleState.resetToken) {
        return
    }

    updateHpBar('player')
    addBattleLog(`${pokemon1.name} entered the battle!`)

    updateTeamDots('player')
    updateTeamDots('opponent')

    addBattleLog('The battle began!', 'success')
    addBattleLog(getFirstTurnMessage())
    handleTurnChange()
}

const executeMove = (move) => {
    if (!battleState.started || battleState.finished) {
        return
    }

    const attackerSide = battleState.currentTurn
    const defenderSide = getOpponentSide(attackerSide)
    const attacker = battleState[attackerSide]
    const defender = battleState[defenderSide]

    addBattleLog(`${attacker.name} used ${move.displayName}!`, 'action')

    if (!checkMoveAccuracy(move)) {
        if (attackerSide === 'player') {
            playSound('failAttack')
        }

        addBattleLog('The move missed!', 'error')
        battleState.currentTurn = defenderSide
        handleTurnChange()
        return
    }

    const damageData = calculateMoveDamage(attacker, defender, move)
    const damage = damageData.damage
    const previousHp = defender.currentHp

    defender.currentHp = Math.max(defender.currentHp - damage, 0)
    updateHpBar(defenderSide, previousHp)

    if (damageData.typeMultiplier > 1) {
        addBattleLog('It was super effective!', 'success')
    } else if (damageData.typeMultiplier < 1) {
        addBattleLog('It was not very effective!', 'info')
    }

    addBattleLog(`${defender.name} lost ${damage} HP.`, 'action')

    if (defender.currentHp === 0) {
        addBattleLog(`${defender.name} was defeated!`, 'action')
        handlePokemonDefeated(defenderSide)
        return
    }

    battleState.currentTurn = defenderSide
    handleTurnChange()
}

const instantDefeatOpponent = () => {
    if (!battleState.started || battleState.finished || !battleState.opponent) {
        addBattleLog('TEST KO only works during battle.', 'error')
        return
    }

    hideMachineMoveBubble()
    clearMoveButtons()
    battleState.machineThinking = false
    const previousHp = battleState.opponent.currentHp
    battleState.opponent.currentHp = 0
    updateHpBar('opponent', previousHp)
    addBattleLog(`TEST KO: super effective hit on ${battleState.opponent.name}!`, 'success')
    addBattleLog(`${battleState.opponent.name} was defeated!`, 'action')
    handlePokemonDefeated('opponent')
}

const usePotion = () => {
    const playerPokemon = battleState.player

    if (!canUsePotion()) {
        addBattleLog(getPotionUnavailableMessage(), 'error')
        return
    }

    const previousHp = playerPokemon.currentHp
    playerPokemon.currentHp = Math.min(playerPokemon.currentHp + 40, playerPokemon.maxHp)
    journeyState.potionsUsed += 1

    playSound('glug')
    updateHpBar('player', previousHp)
    flashPlayerPotionHeal()
    updatePotionControl()
    addBattleLog(`Potion healed ${playerPokemon.name} by ${playerPokemon.currentHp - previousHp} HP.`, 'success')
}

const canUsePotion = () => {
    const playerPokemon = battleState.player

    return battleState.started
        && !battleState.finished
        && battleState.currentTurn === 'player'
        && !battleState.waitingForPlayerSwitch
        && getRemainingPotions() > 0
        && playerPokemon
        && !playerPokemon.defeated
        && playerPokemon.currentHp > 0
        && playerPokemon.currentHp < playerPokemon.maxHp
}

const getPotionUnavailableMessage = () => {
    const playerPokemon = battleState.player

    if (getRemainingPotions() <= 0) {
        return 'You have no potions left.'
    }

    if (!battleState.started || battleState.finished || !playerPokemon) {
        return 'The potion can only be used during battle.'
    }

    if (battleState.currentTurn !== 'player') {
        return 'Use the potion on your turn.'
    }

    if (battleState.waitingForPlayerSwitch || playerPokemon.defeated || playerPokemon.currentHp <= 0) {
        return 'Choose a Pokemon before using the potion.'
    }

    if (playerPokemon.currentHp >= playerPokemon.maxHp) {
        return `${playerPokemon.name} already has full HP.`
    }

    return 'You cannot use the potion right now.'
}

const getRemainingPotions = () => {
    return Math.max(journeyState.maxPotions - journeyState.potionsUsed, 0)
}

const updatePotionControl = () => {
    const potionControl = document.getElementById('potionControl')
    const potionCount = document.getElementById('potionCount')

    if (!potionControl || !potionCount) {
        return
    }

    potionCount.textContent = `x${getRemainingPotions()}`
    potionControl.disabled = !canUsePotion()
    potionControl.classList.toggle('empty', getRemainingPotions() <= 0)
}

const flashPlayerPotionHeal = () => {
    const playerElement = document.getElementById(pokemonSides.player.pokemonId)

    if (!playerElement) {
        return
    }

    playerElement.classList.remove('potionHealFlash')
    void playerElement.offsetWidth
    playerElement.classList.add('potionHealFlash')
}

const checkMoveAccuracy = (move) => {
    const accuracy = move.accuracy ?? 100

    if (accuracy >= 100) {
        return true
    }

    return Math.random() * 100 < accuracy
}

const calculateMoveDamage = (attacker, defender, move) => {
    const stabMultiplier = move.type === attacker.type ? 1.5 : 1
    const typeMultiplier = getTypeMultiplier(move.type, defender.type)
    const movePower = move.power || 0
    const baseDamage = (movePower / 3) + (attacker.stats.attack / 3) - (defender.stats.defense / 4)
    const damage = Math.max(Math.floor(baseDamage * stabMultiplier * typeMultiplier), 1)

    return {
        damage,
        typeMultiplier,
        stabMultiplier
    }
}

const getTypeMultiplier = (moveType, defenderType) => {
    const typeChart = {
        normal: { rock: 0.5, ghost: 0 },
        fire: { grass: 2, ice: 2, bug: 2, water: 0.5, rock: 0.5, fire: 0.5 },
        water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5 },
        grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, bug: 0.5 },
        electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, ground: 0 },
        ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5 },
        fighting: { normal: 2, ice: 2, rock: 2, dark: 2, fairy: 0.5, psychic: 0.5, ghost: 0 },
        poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5 },
        ground: { fire: 2, electric: 2, poison: 2, rock: 2, grass: 0.5, bug: 0.5, flying: 0 },
        flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5 },
        psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0 },
        bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5 },
        rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5 },
        ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
        dragon: { dragon: 2, steel: 0.5, fairy: 0 },
        dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
        steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5 },
        fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 }
    }

    return typeChart[moveType] && typeChart[moveType][defenderType] !== undefined
        ? typeChart[moveType][defenderType]
        : 1
}

const renderMoveButtons = () => {
    const moveButtons = document.getElementById('moveButtons')
    const currentPokemon = battleState[battleState.currentTurn]

    if (!moveButtons || !currentPokemon || battleState.finished || isMachineTurn()) {
        clearMoveButtons()
        return
    }

    hideMachineMoveBubble()

    const turnMoves = getPlayerTurnMoves(currentPokemon)

    moveButtons.innerHTML = turnMoves.map((move, index) => `
        <button class="moveButton" data-move-index="${index}">
            ${move.displayName}
        </button>
    `).join('')

    moveButtons.querySelectorAll('.moveButton').forEach((button) => {
        button.addEventListener('click', () => {
            const moveIndex = parseInt(button.dataset.moveIndex)
            playSound('attack')
            executeMove(turnMoves[moveIndex])
        })
    })
}

const clearMoveButtons = () => {
    const moveButtons = document.getElementById('moveButtons')

    if (moveButtons) {
        moveButtons.innerHTML = ''
    }
}

const handleTurnChange = () => {
    updateTurnIndicator()
    updatePotionControl()

    if (battleState.waitingForPlayerSwitch) {
        clearMoveButtons()
        return
    }

    if (isMachineTurn()) {
        clearMoveButtons()
        executeMachineTurn()
        return
    }

    renderMoveButtons()
}

const isMachineTurn = () => {
    return battleState.started && !battleState.finished && battleState.currentTurn === 'opponent'
}

const executeMachineTurn = () => {
    if (!isMachineTurn() || battleState.machineThinking) {
        return
    }

    battleState.machineThinking = true
    addBattleLog(`${getOpponentTrainerName()} is thinking...`)

    const delay = Math.floor(Math.random() * 401) + 800

    const thinkingTimer = setTimeout(() => {
        if (!isMachineTurn()) {
            battleState.machineThinking = false
            hideMachineMoveBubble()
            return
        }

        const machinePokemon = battleState.opponent
        const move = chooseMachineMove(machinePokemon, battleState.player)

        showMachineMoveBubble(machinePokemon, move)

        const attackTimer = setTimeout(() => {
            hideMachineMoveBubble()
            battleState.machineThinking = false
            executeMove(move)
        }, 2000)

        battleTimers.push(attackTimer)
    }, delay)

    battleTimers.push(thinkingTimer)
}

const setAiDifficulty = (difficulty, fromTrainer = false) => {
    if (journeyState.isJourneyMode && !fromTrainer) {
        addBattleLog('In journey mode, the current trainer sets the difficulty.')
        updateAiDifficultyButtons()
        return
    }

    if (!aiDifficultyLabels[difficulty]) {
        difficulty = 'medium'
    }

    battleState.aiDifficulty = difficulty
    updateAiDifficultyButtons()
    addBattleLog(`AI difficulty: ${aiDifficultyLabels[difficulty]}`)
}

const getAiDifficulty = () => {
    return battleState.aiDifficulty || 'medium'
}

const updateAiDifficultyButtons = () => {
    const difficulty = getAiDifficulty()
    const buttons = document.querySelectorAll('.aiDifficultyButton')

    buttons.forEach((button) => {
        button.classList.toggle('active', button.dataset.aiDifficulty === difficulty)
    })
}

const chooseMachineMove = (machinePokemon, playerPokemon) => {
    const difficulty = getAiDifficulty()
    const turnMoves = getMachineTurnMoves(machinePokemon)

    if (difficulty === 'easy') {
        console.log('easy: random move')
        return chooseRandomMove(turnMoves)
    }

    if (difficulty === 'hard') {
        console.log('hard: best expected damage from turn moves')
        return chooseBestExpectedDamageMove(machinePokemon, playerPokemon, turnMoves)
    }

    if (Math.random() < 0.7) {
        console.log('medium: best move from turn moves')
        return chooseBestExpectedDamageMove(machinePokemon, playerPokemon, turnMoves)
    }

    console.log('medium: random move')
    return chooseRandomMove(turnMoves)
}

const chooseRandomMove = (moves) => {
    return getRandomItem(moves) || getFallbackMove()
}

const chooseBestExpectedDamageMove = (attacker, defender, turnMoves) => {
    const moves = getAvailableDamageMoves(attacker, turnMoves)

    return moves.reduce((bestMove, move) => {
        const currentDamage = calculateExpectedDamage(attacker, defender, move)
        const bestDamage = calculateExpectedDamage(attacker, defender, bestMove)

        return currentDamage > bestDamage ? move : bestMove
    }, moves[0])
}

const calculateExpectedDamage = (attacker, defender, move) => {
    if (!move.power) {
        return 0
    }

    const accuracy = move.accuracy ?? 100
    const damageData = calculateMoveDamage(attacker, defender, move)

    return damageData.damage * (accuracy / 100)
}

const getAvailableDamageMoves = (pokemon, turnMoves = null) => {
    const moves = turnMoves || (pokemon.moves && pokemon.moves.length ? pokemon.moves : [])

    if (turnMoves) {
        return moves.length ? moves : [getFallbackMove()]
    }

    const damageMoves = moves.filter((move) => move.power > 0)

    return damageMoves.length ? damageMoves : [getFallbackMove()]
}

const showMachineMoveBubble = (pokemon, move) => {
    const bubble = document.getElementById('machineMoveBubble')

    if (!bubble) {
        return
    }

    bubble.textContent = `${pokemon.name} usou ${move.displayName}!`
    bubble.classList.add('active')
}

const hideMachineMoveBubble = () => {
    const bubble = document.getElementById('machineMoveBubble')

    if (!bubble) {
        return
    }

    bubble.classList.remove('active')
    bubble.textContent = ''
}

const updateHpBar = (side, fromHp = null) => {
    const pokemon = battleState[side]
    const settings = pokemonSides[side]
    const pokemonElement = document.getElementById(settings.pokemonId)
    const lifeBar = pokemonElement && pokemonElement.querySelector(`.${settings.lifeClass}`)
    const hpText = pokemonElement && pokemonElement.querySelector('.hpText')

    if (!pokemon || !pokemonElement || !lifeBar || !hpText) {
        return
    }

    const startHp = fromHp === null ? pokemon.currentHp : fromHp
    const endHp = pokemon.currentHp

    animateHpBar(pokemon, lifeBar, hpText, startHp, endHp)
}

const animateHpBar = (pokemon, lifeBar, hpText, startHp, endHp) => {
    const difference = Math.abs(startHp - endHp)
    const steps = Math.max(Math.min(difference, 24), 1)
    let currentStep = 0

    const renderHpStep = () => {
        const progress = currentStep / steps
        const currentHp = Math.round(startHp + (endHp - startHp) * progress)
        const hpPercent = Math.max((currentHp / pokemon.maxHp) * 100, 0)

        lifeBar.style.width = `${hpPercent}%`
        hpText.textContent = `HP: ${currentHp}/${pokemon.maxHp}`

        if (currentStep >= steps) {
            return
        }

        currentStep += 1
        const timer = setTimeout(renderHpStep, 30)
        battleTimers.push(timer)
    }

    renderHpStep()
}

const updateTurnIndicator = () => {
    Object.keys(pokemonSides).forEach((side) => {
        const pokemonElement = document.getElementById(pokemonSides[side].pokemonId)

        if (pokemonElement) {
            pokemonElement.classList.toggle('activeTurn', side === battleState.currentTurn && !battleState.finished)
        }
    })
}

const addBattleLog = (message, type = 'default') => {
    const battleLog = document.getElementById('battleLog')

    if (!battleLog) {
        return
    }

    battleLog.innerHTML += `<p class="battleLogMessage ${getBattleLogClass(type)}">${message}</p>`
    battleLog.scrollTop = battleLog.scrollHeight
}

const getBattleLogClass = (type) => {
    const classes = {
        error: 'battleLogError',
        action: 'battleLogError',
        success: 'battleLogSuccess',
        info: 'battleLogInfo',
        default: 'battleLogInfo'
    }

    return classes[type] || classes.default
}

const handlePokemonDefeated = async (defeatedSide) => {
    const defeatedPokemon = battleState[defeatedSide]

    defeatedPokemon.defeated = true

    playSound('deathPok')

    if (defeatedSide === 'player') {
        playSound('cry')
    }

    updateTeamDots(defeatedSide)
    renderTeamSummary()
    clearMoveButtons()
    hideMachineMoveBubble()

    if (defeatedSide === 'opponent') {
        if (!hasAlivePokemon(battleState.machineTeam)) {
            addBattleLog(`All of ${getOpponentTrainerName()}'s Pokemon were defeated!`, 'success')
            finishThreeVsThreeBattle('player')
            return
        }

        if (!await playPokemonDefeatSequence(defeatedSide, defeatedPokemon.name)) {
            return
        }

        switchMachinePokemon()
        return
    }

    if (!hasAlivePokemon(battleState.playerTeam)) {
        addBattleLog('All of your Pokemon were defeated!', 'error')
        finishThreeVsThreeBattle('opponent')
        return
    }

    if (!await playPokemonDefeatSequence(defeatedSide, defeatedPokemon.name)) {
        return
    }

    battleState.waitingForPlayerSwitch = true
    addBattleLog('Choose your next Pokemon.', 'info')
    showPlayerSwitchOptions()
}

const hasAlivePokemon = (team) => {
    return team.some((pokemon) => !pokemon.defeated)
}

const getNextAlivePokemon = (team) => {
    return team.findIndex((pokemon) => !pokemon.defeated)
}

const showPlayerSwitchOptions = () => {
    const switchOptions = document.getElementById('switchOptions')

    if (!switchOptions) {
        renderTeamSummary()
        updatePotionControl()
        return
    }

    switchOptions.classList.remove('active')
    switchOptions.innerHTML = ''
    renderTeamSummary()
    updatePotionControl()
}

const hidePlayerSwitchOptions = () => {
    const switchOptions = document.getElementById('switchOptions')

    if (switchOptions) {
        switchOptions.classList.remove('active')
        switchOptions.innerHTML = ''
    }

    renderTeamSummary()
    updatePotionControl()
}

const switchPlayerPokemon = async (index) => {
    const pokemon = battleState.playerTeam[index]

    if (!battleState.waitingForPlayerSwitch || !pokemon || pokemon.defeated) {
        return
    }

    battleState.playerActiveIndex = index
    battleState.player = pokemon
    battleState.waitingForPlayerSwitch = false
    hidePlayerSwitchOptions()
    renderTeamSummary()
    playSound('pokeballOpen')
    renderPokemon(pokemon, 'player')
    await wait(1900)
    updateHpBar('player')
    addBattleLog(`You sent out ${pokemon.name}!`)
    resetTurnAfterSwitch()
}

const switchMachinePokemon = async () => {
    const nextIndex = getNextAlivePokemon(battleState.machineTeam)

    if (nextIndex === -1) {
        finishThreeVsThreeBattle('player')
        return
    }

    const pokemon = battleState.machineTeam[nextIndex]

    battleState.machineActiveIndex = nextIndex
    battleState.opponent = pokemon
    playSound('pokeballOpen')
    renderPokemon(pokemon, 'opponent')
    await wait(1900)
    updateHpBar('opponent')
    addBattleLog(`${getOpponentTrainerName()} sent out ${pokemon.name}!`)
    resetTurnAfterSwitch()
}

const playPokemonDefeatSequence = async (side, pokemonName) => {
    animatePokemonFaint(side)
    await wait(1600)

    if (!battleState.started || battleState.finished) {
        return false
    }

    showPokemonDefeatedMessage(side, pokemonName)
    await wait(2000)

    return battleState.started && !battleState.finished
}

const animatePokemonFaint = (side) => {
    const settings = pokemonSides[side]
    const container = document.getElementById(settings.containerId)

    if (!container) {
        return
    }

    const smokeImages = [1, 2, 3]

    smokeImages.forEach((image, index) => {
        const timer = setTimeout(() => {
            container.innerHTML = `<img class='${settings.smokeClass}' src='../../assets/img/smoke${image}.png'>`
        }, index * 400)

        battleTimers.push(timer)
    })
}

const showPokemonDefeatedMessage = (side, pokemonName) => {
    const settings = pokemonSides[side]
    const container = document.getElementById(settings.containerId)

    if (!container) {
        return
    }

    container.innerHTML = `
        <div class="defeatedMessage">
            ${pokemonName} fainted!
        </div>
    `
}

const resetTurnAfterSwitch = () => {
    battleState.currentTurn = chooseFirstTurn(battleState.player, battleState.opponent)
    addBattleLog(getFirstTurnMessage())
    handleTurnChange()
}

const updateTeamDots = (side) => {
    const dotsElement = document.getElementById(side === 'player' ? 'playerTeamDots' : 'machineTeamDots')
    const team = side === 'player' ? battleState.playerTeam : battleState.machineTeam

    if (!dotsElement) {
        return
    }

    if (!battleState.started) {
        dotsElement.innerHTML = ''
        dotsElement.classList.remove('active')
        return
    }

    dotsElement.classList.add('active')
    dotsElement.innerHTML = [0, 1, 2].map((index) => {
        const pokemon = team[index]
        const defeatedClass = pokemon && pokemon.defeated ? ' defeated' : ''

        return `<span class="teamDot${defeatedClass}"></span>`
    }).join('')
}

const finishThreeVsThreeBattle = (winner) => {
    const winnerSide = winner === 'player' ? 'player' : 'opponent'
    const trainerName = getOpponentTrainerName()

    addBattleLog(winner === 'player' ? `You defeated ${trainerName}!` : `${trainerName} won the battle!`, winner === 'player' ? 'success' : 'error')
    finishBattle(winnerSide)
}

const finishBattle = (winnerSide) => {
    const winner = battleState[winnerSide]
    const loserSide = getOpponentSide(winnerSide)

    battleState.finished = true
    battleState.machineThinking = false
    battleState.currentTurn = null
    updateTurnIndicator()
    updatePotionControl()
    addBattleLog(`${winner.name} won the battle!`, winnerSide === 'player' ? 'success' : 'error')
    const isFinalJourneyVictory = isLastJourneyTrainerBattle(winnerSide)

    if (winnerSide === 'opponent') {
        playSound('lose')
    } else if (!isFinalJourneyVictory) {
        playSound('win')
    }

    if (!isFinalJourneyVictory) {
        animateDefeat(loserSide, winnerSide === 'player' ? 'You won' : 'You lose')
        showFinalTrainerResult(winnerSide)
    }

    hideMachineMoveBubble()
    clearMoveButtons()
    hidePlayerSwitchOptions()
    setBattleButton('NEW BATTLE', false, false)
    setBattleMenuMode('finished')
    handleJourneyBattleResult(winnerSide)
}

const isLastJourneyTrainerBattle = (winnerSide) => {
    return journeyState.isJourneyMode
        && winnerSide === 'player'
        && journeyState.currentTrainerIndex >= journeyState.trainers.length - 1
}

const handleJourneyBattleResult = (winnerSide) => {
    if (!journeyState.isJourneyMode) {
        return
    }

    if (winnerSide === 'player') {
        handleJourneyVictory()
        return
    }

    handleJourneyDefeat()
}

const handleJourneyVictory = () => {
    const trainer = getCurrentTrainer()

    journeyState.phase = 'result'
    journeyState.result = 'victory'

    if (trainer && !journeyState.completedTrainers.includes(trainer.index)) {
        journeyState.completedTrainers.push(trainer.index)
    }

    if (trainer) {
        addBattleLog(`${trainer.name}: ${trainer.defeatText}`, 'success')
    }

    if (journeyState.currentTrainerIndex >= journeyState.trainers.length - 1) {
        completeJourney()
        return
    }

    setBattleButton('Next Battle', false, false)
}

const completeJourney = () => {
    journeyState.phase = 'journeyComplete'
    journeyState.result = 'victory'
    setBattleButton('...', true, false)

    const championTimer = setTimeout(() => {
        stopAllSounds()
        showChampionCelebration()
        playSound('finishGame')
        addBattleLog('Congratulations! You conquered the great Pokemon challenge!', 'success')
        setBattleButton('New Game', false, false)
    }, 3000)

    battleTimers.push(championTimer)
}

const handleJourneyDefeat = () => {
    const trainer = getCurrentTrainer()

    journeyState.phase = 'result'
    journeyState.result = 'defeat'

    if (trainer) {
        addBattleLog(`You lost to ${trainer.name}.`, 'error')
    }

    setBattleButton(hasContinuesAvailable() ? 'Continue' : 'New Game', false, false)
}

const handleJourneyButtonAction = () => {
    if (journeyState.result === 'victory') {
        if (journeyState.currentTrainerIndex >= journeyState.trainers.length - 1) {
            restartJourney()
            return
        }

        goToNextTrainer()
        return
    }

    if (journeyState.result === 'defeat') {
        if (hasContinuesAvailable()) {
            journeyState.continueUsed += 1
            updateContinueCounter()
            retryCurrentTrainer()
            return
        }

        restartJourney()
        return
    }

    restartJourney()
}

const goToNextTrainer = () => {
    journeyState.currentTrainerIndex += 1
    loadTrainerBattle(journeyState.currentTrainerIndex)
}

const retryCurrentTrainer = () => {
    resetBattleForJourneySetup()
    showJourneyContinue()
    showMessage(`Continue: face ${getOpponentTrainerName()} again.`, 'info')
}

const restartJourney = () => {
    journeyState.currentTrainerIndex = 0
    journeyState.completedTrainers = []
    journeyState.continueUsed = 0
    journeyState.potionsUsed = 0
    updateContinueCounter()
    updatePotionControl()
    resetBattleForJourneySetup()
    showMessage('New Game: the journey returned to Mariner.', 'info')
}

const animateDefeat = (loserSide, resultMessage) => {
    const settings = pokemonSides[loserSide]
    const container = document.getElementById(settings.containerId)

    if (!container) {
        return
    }

    const smokeImages = [1, 2, 3]

    smokeImages.forEach((image, index) => {
        const timer = setTimeout(() => {
            container.innerHTML = `<img class='${settings.smokeClass}' src='../../assets/img/smoke${image}.png'>`
        }, 400 + index * 400)

        battleTimers.push(timer)
    })

    const winnerTimer = setTimeout(() => {
        container.innerHTML = `
            <marquee direction="right" behavior="alternate" class="winnerMensage">
                ${resultMessage}
            </marquee>
        `
    }, 1700)

    battleTimers.push(winnerTimer)
}

const showFinalTrainerResult = (winnerSide) => {
    const settings = pokemonSides[winnerSide]
    const container = document.getElementById(settings.containerId)
    const trainer = getCurrentTrainer()

    if (!container) {
        return
    }

    const trainerImage = winnerSide === 'player'
        ? '../../assets/img/ash_win.png'
        : (trainer && trainer.image ? trainer.image : '')
    const trainerAlt = winnerSide === 'player' ? 'Ash won' : `${getOpponentTrainerName()} won`
    const resultClass = winnerSide === 'player' ? 'playerResult' : 'machineResult'
    const journeyProgress = winnerSide === 'player' ? getJourneyProgressMarkup() : ''

    const resultTimer = setTimeout(() => {
        if (winnerSide === 'player') {
            showJourneyVictoryProgress(trainerImage, trainerAlt, journeyProgress)
            return
        }

        container.innerHTML = `
            <div class="battleResultTrainer ${resultClass}">
                ${trainerImage ? `<img src="${trainerImage}" alt="${trainerAlt}">` : `<span>${getOpponentTrainerName()} won</span>`}
            </div>
        `
    }, 2000)

    battleTimers.push(resultTimer)
}

const showJourneyVictoryProgress = (trainerImage, trainerAlt, journeyProgress) => {
    battleState.started = false
    updateTeamDots('player')
    updateTeamDots('opponent')

    const playerContainer = document.getElementById(pokemonSides.player.containerId)
    const opponentContainer = document.getElementById(pokemonSides.opponent.containerId)
    const textScreen = document.getElementById('textScreen')
    const ball = document.getElementById('ball')

    if (playerContainer) {
        playerContainer.innerHTML = ''
    }

    if (opponentContainer) {
        opponentContainer.innerHTML = ''
    }

    if (ball) {
        ball.style.display = 'none'
    }

    if (textScreen) {
        textScreen.innerHTML = `
            <div class="journeyVictoryScreen">
                <img class="ashWinResult" src="${trainerImage}" alt="${trainerAlt}">
                <p class="journeyVictoryText">You won!</p>
                <div class="journeyProgressPanel">
                    ${journeyProgress}
                </div>
            </div>
        `
        textScreen.style.display = 'block'

        const xSoundTimer = setTimeout(() => {
            playSound('xEnter')
        }, 1000)

        battleTimers.push(xSoundTimer)
    }
}

const getJourneyProgressMarkup = () => {
    const defeatedIndexes = new Set([...journeyState.completedTrainers])
    const trainer = getCurrentTrainer()

    if (trainer) {
        defeatedIndexes.add(trainer.index)
    }

    return `
        <p class="journeyProgressTitle">Next challenge:</p>
        <div class="journeyFaceRow">
            ${journeyState.trainers.map((trainer) => {
                const defeatedClass = defeatedIndexes.has(trainer.index) ? ' defeated' : ''

                return `
                    <div class="journeyFace${defeatedClass}" title="${trainer.name}">
                        <img src="${trainer.face}" alt="${trainer.name}">
                    </div>
                `
            }).join('')}
        </div>
    `
}

const showChampionCelebration = () => {
    battleState.started = false
    clearMoveButtons()
    hideMachineMoveBubble()
    hidePlayerSwitchOptions()
    updateTeamDots('player')
    updateTeamDots('opponent')

    const playerContainer = document.getElementById(pokemonSides.player.containerId)
    const opponentContainer = document.getElementById(pokemonSides.opponent.containerId)
    const textScreen = document.getElementById('textScreen')
    const ball = document.getElementById('ball')

    if (playerContainer) {
        playerContainer.innerHTML = ''
    }

    if (opponentContainer) {
        opponentContainer.innerHTML = ''
    }

    if (ball) {
        ball.style.display = 'none'
    }

    if (textScreen) {
        textScreen.innerHTML = `
            <p class="championTitle">Congratulations, Champion!</p>
            <p class="championSubtitle">You defeated all 6 trainers and completed the journey.</p>
            <img src="../../assets/img/ash-champion.png" class="screenText championAsh" alt="Ash champion">
        `
        textScreen.style.display = 'block'
    }
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
        return `${currentPokemon.name} starts by luck after a speed tie!`
    }

    return `${currentPokemon.name} starts for being faster!`
}

const getOpponentSide = (side) => {
    return side === 'player' ? 'opponent' : 'player'
}

const resetBattle = () => {
    battleState.started = false
    battleState.finished = false
    battleState.machineThinking = false
    battleState.waitingForPlayerSwitch = false
    battleState.currentTurn = null
    setBattleButton('START 3x3', false, false)
    clearBattleLog()
    clearMoveButtons()
    hideMachineMoveBubble()
    hidePlayerSwitchOptions()
    updateTurnIndicator()
}

const resetFullBattle = () => {
    journeyState.currentTrainerIndex = 0
    journeyState.completedTrainers = []
    journeyState.continueUsed = 0
    journeyState.potionsUsed = 0
    updateContinueCounter()
    updatePotionControl()
    resetBattleForJourneySetup()
}

const resetBattleForJourneySetup = () => {
    battleState.resetToken += 1
    battleState.player = null
    battleState.opponent = null
    battleState.playerTeam = []
    battleState.machineTeam = []
    battleState.playerActiveIndex = 0
    battleState.machineActiveIndex = 0
    battleState.started = false
    battleState.finished = false
    battleState.currentTurn = null
    battleState.selectingMachine = false
    battleState.machineThinking = false
    battleState.waitingForPlayerSwitch = false
    journeyState.phase = 'setup'
    journeyState.result = null
    updateContinueCounter()

    clearSideTimers('player')
    clearSideTimers('opponent')
    clearBattleTimers()
    clearBattleLog()
    clearMoveButtons()
    hideMachineMoveBubble()
    hideTrainerIntro()
    clearMessage()
    hidePlayerSwitchOptions()
    clearBattleScreen()
    renderPlayerTeamSlots()
    renderTeamSummary()
    updateTeamDots('player')
    updateTeamDots('opponent')
    updateTurnIndicator()
    const trainer = getCurrentTrainer()
    battleState.aiDifficulty = trainer ? trainer.difficulty : 'medium'
    updateAiDifficultyButtons()
    setSearchControls(false)
    setBattleMenuMode('setup')
    setBattleButton('START 3x3', true, false)
}

const clearBattleLog = () => {
    const battleLog = document.getElementById('battleLog')

    if (battleLog) {
        battleLog.innerHTML = ''
    }
}

const setBattleButton = (text, disabled, hidden) => {
    const button = document.querySelector('.toBattle')

    if (button) {
        button.textContent = text
        button.disabled = disabled
        button.style.display = hidden ? 'none' : 'inline-block'
    }
}

const showTrainerIntro = (trainer) => {
    playSound('songBattle')
    updateScreenTrainerIntro(true, trainer)
}

const hideTrainerIntro = () => {
    const textScreen = document.getElementById('textScreen')

    if (textScreen) {
        textScreen.style.display = 'none'
    }
}

const showJourneyWelcome = () => {
    const textScreen = document.getElementById('textScreen')

    if (!textScreen) {
        return
    }

    textScreen.innerHTML = `
        <p class="galeIntroText">Welcome to the great Pokemon challenge. Good luck!</p>
        <div class="ashIntroWrap">
            <img src="../../assets/img/enter_ash.png" class="screenText trainerGale" alt="Ash entering the Pokemon challenge">
            <span class="desktopAshCue" aria-hidden="true">
                <img src="../../assets/img/pokeballPixel.png" class="desktopAshBall" alt="">
                <span class="desktopAshArrow">></span>
            </span>
        </div>
    `
    textScreen.style.display = 'block'
    updateIdleBallMode()
}

const showJourneyContinue = () => {
    const textScreen = document.getElementById('textScreen')

    if (!textScreen) {
        return
    }

    textScreen.innerHTML = `
        <p class="galeIntroText continueIntroText">Let's continue the journey?</p>
        <div class="ashIntroWrap">
            <img src="../../assets/img/ash-cry.png" class="screenText trainerGale" alt="Ash returns to continue the Pokemon challenge">
            <span class="desktopAshCue" aria-hidden="true">
                <img src="../../assets/img/pokeballPixel.png" class="desktopAshBall" alt="">
                <span class="desktopAshArrow">>></span>
            </span>
        </div>
    `
    textScreen.style.display = 'block'
    updateIdleBallMode()
}

const updateIdleBallMode = () => {
    const ball = document.getElementById('ball')

    if (!ball) {
        return
    }

    ball.classList.toggle('desktopIdleBall', window.innerWidth > 1100)
}

const updateContinueCounter = () => {
    const continueCounter = document.getElementById('continueCounter')

    if (!continueCounter) {
        return
    }

    continueCounter.textContent = `CONTINUE x${getRemainingContinues()}`
}

const getRemainingContinues = () => {
    return Math.max(journeyState.maxContinues - journeyState.continueUsed, 0)
}

const hasContinuesAvailable = () => {
    return getRemainingContinues() > 0
}

const updateScreenTrainerIntro = (showChallenge = false, selectedTrainer = getCurrentTrainer()) => {
    const trainer = selectedTrainer
    const textScreen = document.getElementById('textScreen')

    if (!textScreen) {
        return
    }

    if (!trainer) {
        textScreen.innerHTML = '<p class="galeIntroText">Journey complete!</p>'
        return
    }

    const challengeMarkup = showChallenge
        ? `
            <p class="trainerAiText ${trainer.difficulty}">${capitalize(trainer.difficulty)} AI</p>
            <p class="trainerChallengeText"></p>
        `
        : ''

    textScreen.innerHTML = `
        <p class="galeIntroText">${trainer.name} is challenging you!</p>
        ${challengeMarkup}
        <img src="${trainer.image}" class="screenText trainerGale${showChallenge ? ' trainerChallengeImage' : ''}" alt="Trainer ${trainer.name}">
    `
    textScreen.style.display = 'block'

    if (showChallenge) {
        typeTrainerChallenge(trainer.challengeText)
    }
}

const typeTrainerChallenge = (text) => {
    const challenge = document.querySelector('.trainerChallengeText')

    if (!challenge) {
        return
    }

    const message = `"${text}"`
    let currentIndex = 0

    challenge.textContent = ''

    const typeNextLetter = () => {
        currentIndex += 1
        challenge.textContent = message.slice(0, currentIndex)

        if (currentIndex >= message.length) {
            return
        }

        const timer = setTimeout(typeNextLetter, 42)
        battleTimers.push(timer)
    }

    typeNextLetter()
}

const setBattleMenuMode = (mode) => {
    const menuTitle = document.querySelector('.txtMenu')
    const slots = document.getElementById('playerTeamSlots')
    const randomButton = document.querySelector('.randomTeamButton')
    const teamSummary = document.getElementById('teamSummary')
    const potionControl = document.getElementById('potionControl')
    const battlePanel = document.querySelector('.battlePanel')
    const isSetup = mode === 'setup'

    if (mode === 'setup') {
        showJourneyWelcome()
    }

    if (menuTitle) {
        menuTitle.textContent = isSetup ? 'Choose your 3 Pokémon team:' : 'Your team:'
        menuTitle.style.display = 'block'
    }

    if (slots) {
        slots.style.display = isSetup ? 'grid' : 'none'
    }

    if (randomButton) {
        randomButton.style.display = isSetup ? 'inline-block' : 'none'
    }

    if (teamSummary) {
        renderTeamSummary()
        teamSummary.style.display = isSetup ? 'none' : 'flex'
    }

    if (potionControl) {
        potionControl.style.display = isSetup ? 'none' : 'inline-flex'
        updatePotionControl()
    }

    if (battlePanel) {
        battlePanel.classList.toggle('battlePanelActive', !isSetup)
    }
}

const renderTeamSummary = () => {
    const teamSummary = document.getElementById('teamSummary')

    if (!teamSummary) {
        return
    }

    const teamSprites = getTeamSlotIndexes().map((index) => {
        const pokemon = battleState.playerTeam[index]

        if (!pokemon) {
            return ''
        }

        const isActive = index === battleState.playerActiveIndex
        const isSelectable = battleState.waitingForPlayerSwitch && !pokemon.defeated && !isActive
        const defeatedClass = pokemon.defeated ? ' defeated' : ''
        const selectableClass = isSelectable ? ' selectable' : ''
        const activeClass = isActive ? ' active' : ''
        const disabledAttribute = isSelectable ? '' : ' disabled'

        return `
            <button class="teamSummaryPokemonSlot${defeatedClass}${selectableClass}${activeClass}" type="button" onclick="switchPlayerPokemon(${index})" title="${pokemon.name} HP ${pokemon.currentHp}/${pokemon.maxHp}"${disabledAttribute}>
                <img class="teamSummaryPokemon" src="${pokemon.sprites.front}" alt="${pokemon.name}">
            </button>
        `
    }).join('')

    teamSummary.innerHTML = `
        <div class="teamSummarySprites">${teamSprites}</div>
    `
}

const setSearchControls = (disabled) => {
    const controls = document.querySelectorAll('.teamSlotInput, .teamSlotAdd, .teamSlotRemove')
    const shouldDisable = disabled || battleState.started

    controls.forEach((control) => {
        control.disabled = shouldDisable
    })

    setRandomTeamButton(shouldDisable)
}

const setRandomTeamButton = (disabled) => {
    const button = document.querySelector('.randomTeamButton')

    if (button) {
        button.disabled = disabled
    }
}

const clearBattleScreen = ({ showIdleBall = true, showWelcome = true } = {}) => {
    const playerContainer = document.getElementById(pokemonSides.player.containerId)
    const opponentContainer = document.getElementById(pokemonSides.opponent.containerId)
    const textScreen = document.getElementById('textScreen')
    const ball = document.getElementById('ball')
    const power = document.getElementById('powerId')
    const inputs = document.querySelectorAll('.teamSlotInput')

    if (playerContainer) {
        playerContainer.innerHTML = ''
    }

    if (opponentContainer) {
        opponentContainer.innerHTML = ''
    }

    if (textScreen) {
        textScreen.style.display = showWelcome ? 'block' : 'none'
    }

    if (ball) {
        ball.style.display = showIdleBall ? 'inline-block' : 'none'
        ball.classList.remove('desktopIdleBall')
    }

    if (power) {
        power.style.color = 'rgb(165, 165, 165)'
    }

    if (showWelcome) {
        showJourneyWelcome()
    }

    inputs.forEach((input) => {
        input.value = ''
    })
}

const scheduleRender = (side, delay, callback) => {
    const timer = setTimeout(callback, delay)
    renderTimers[side].push(timer)
}

const clearSideTimers = (side) => {
    renderTimers[side].forEach((timer) => clearTimeout(timer))
    renderTimers[side] = []
}

const clearBattleTimers = () => {
    battleTimers.forEach((timer) => clearTimeout(timer))
    battleTimers.length = 0
}

const clearMessage = () => {
    document.getElementById('winner').innerHTML = ''
}

const showMessage = (message, type = 'info') => {
    addBattleLog(message, type)
}

const getBallImage = (image) => {
    return `../../assets/img/ballOpen${image}.png`
}

const formatMoveName = (value) => {
    return value
        .split('-')
        .map((word) => capitalize(word))
        .join(' ')
}

const playSound = (soundName) => {
    if (battleState.muted) {
        return
    }

    const sound = sounds[soundName]

    if (!sound) {
        return
    }

    sound.currentTime = 0

    const playPromise = sound.play()

    if (playPromise) {
        playPromise.catch(() => {})
    }
}

const toggleMute = () => {
    battleState.muted = !battleState.muted

    if (battleState.muted) {
        stopAllSounds()
    }

    updateMuteButton()
}

const stopAllSounds = () => {
    Object.values(sounds).forEach((sound) => {
        sound.pause()
        sound.currentTime = 0
    })
}

const updateMuteButton = () => {
    const button = document.getElementById('muteButton')

    if (!button) {
        return
    }

    button.classList.toggle('muted', battleState.muted)
    button.setAttribute('aria-pressed', battleState.muted ? 'true' : 'false')
}

const wait = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time))
}

const capitalize = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

window.addEventListener('load', () => {
    const trainer = getCurrentTrainer()
    battleState.aiDifficulty = trainer ? trainer.difficulty : 'medium'
    renderPlayerTeamSlots()
    renderTeamSummary()
    setBattleMenuMode('setup')
    showJourneyWelcome()
    updateAiDifficultyButtons()
    updateMuteButton()
    updateContinueCounter()
    updatePotionControl()
    updateStartButton()
    playSound('start')
})
