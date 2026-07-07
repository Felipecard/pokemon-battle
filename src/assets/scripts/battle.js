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
    resetToken: 0
}

const pokemonCandidateCache = {}
const teamSize = 3
const maxMachinePokemonId = 251

const sounds = {
    start: new Audio('../../assets/sounds/start.mp3'),
    choose: new Audio('../../assets/sounds/choose.mp3'),
    attack: new Audio('../../assets/sounds/choose_atack.mp3'),
    lose: new Audio('../../assets/sounds/lose.mp3'),
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
        resetFullBattle()
        return
    }

    if (!battleState.started) {
        startThreeVsThreeBattle()
        return
    }

    addBattleLog('Escolha um golpe para atacar.')
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
        showMessage('Enter a Pokemon name or number!')
        return
    }

    try {
        setSearchControls(true)
        clearMessage()
        const data = await getPokemon(pokName)
        const moves = await getPokemonMoves(data.moves)
        const pokemon = normalizePokemon(data, moves)

        if (resetToken !== battleState.resetToken) {
            return
        }

        battleState.playerTeam[slotIndex] = pokemon
        playSound('choose')
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog(`${pokemon.name} entrou no slot ${slotIndex + 1}!`)
    } catch (err) {
        showMessage('Pokemon not found!')
        console.log(err)
    } finally {
        setSearchControls(false)
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
                <span>${pokemon.name}</span>
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
    return getTeamSlotIndexes().every((index) => battleState.playerTeam[index])
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
        const randomPokemon = await Promise.all(randomIds.map(async (pokemonId) => {
            const data = await getPokemon(pokemonId.toString())
            const moves = await getPokemonMoves(data.moves)

            return normalizePokemon(data, moves)
        }))

        if (resetToken !== battleState.resetToken) {
            return
        }

        battleState.playerTeam = randomPokemon
        battleState.machineTeam = []
        playSound('choose')
        renderPlayerTeamSlots()
        renderTeamSummary()
        updateStartButton()
        addBattleLog('Seu time aleatório foi escolhido!')
    } catch (err) {
        showMessage('Could not choose a random team!')
        console.log(err)
    } finally {
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
        showMessage('Enter a Pokemon name or number!')
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
        showMessage('Pokemon not found!')
        setSearchControls(false)
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
    try {
        const response = await fetch(url)

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
            accuracy: data.accuracy || 100,
            damageClass: data.damage_class ? data.damage_class.name : '',
            pp: data.pp
        }
    } catch (err) {
        console.log(err)
        return null
    }
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

const shuffleList = (list) => {
    return [...list].sort(() => Math.random() - 0.5)
}

const getRandomItem = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const normalizePokemon = (data, moves) => {
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
        ready: true
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
    addBattleLog('A máquina está escolhendo um adversário equilibrado...')
    addBattleLog('Analisando candidatos...')

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
        addBattleLog(`A máquina escolheu ${opponent.name}!`)
    } catch (err) {
        console.log(err)
        const fallback = await getFallbackMachinePokemon(playerPokemon)

        battleState.opponent = fallback
        renderPokemon(fallback, 'opponent')
        addBattleLog(`A máquina escolheu ${fallback.name}!`)
    } finally {
        battleState.selectingMachine = false
        setSearchControls(false)
    }
}

const generateMachineTeam = async (playerTeam) => {
    battleState.selectingMachine = true
    battleState.machineTeam = []
    updateStartButton()
    addBattleLog('Você montou seu time!')
    addBattleLog('A máquina está montando um time equilibrado...')

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
            addBattleLog(`A máquina adicionou ${opponent.name} ao time.`)
        }

        addBattleLog('A máquina escolheu seu time!')
    } finally {
        battleState.selectingMachine = false
        updateStartButton()
    }
}

const getBalancedMachinePokemon = async (playerPokemon, excludedIds = new Set()) => {
    const playerPower = calculatePokemonPower(playerPokemon)
    const firstCandidates = await getCandidateSample(playerPokemon, 15, excludedIds)
    let validCandidates = findCandidatesInPowerRange(firstCandidates, playerPower, 0.85, 1.15)

    if (validCandidates.length) {
        return getRandomItem(validCandidates)
    }

    addBattleLog('Buscando mais candidatos...')

    const secondCandidates = await getCandidateSample(playerPokemon, 15, excludedIds)
    const allCandidates = [...firstCandidates, ...secondCandidates]
    validCandidates = findCandidatesInPowerRange(allCandidates, playerPower, 0.75, 1.25)

    if (validCandidates.length) {
        return getRandomItem(validCandidates)
    }

    const closestCandidate = findClosestCandidate(allCandidates, playerPower)

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

const findClosestCandidate = (candidates, playerPower) => {
    return candidates.reduce((closest, candidate) => {
        if (!closest) {
            return candidate
        }

        const currentDistance = Math.abs(candidate.totalPower - playerPower)
        const closestDistance = Math.abs(closest.totalPower - playerPower)

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

const startThreeVsThreeBattle = async () => {
    if (battleState.selectingMachine) {
        showMessage('Wait for the machine to choose its team!')
        return
    }

    if (!isPlayerTeamComplete()) {
        showMessage('Choose 3 Pokemon before battle!')
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
            showMessage('The machine could not build its team. Try again!')
            setBattleButton('START 3x3', false, false)
            return
        } finally {
            setSearchControls(false)
        }
    }

    const pokemon1 = battleState.playerTeam[0]
    const pokemon2 = battleState.machineTeam[0]

    if (battleState.selectingMachine) {
        showMessage('Wait for the machine to choose a Pokemon!')
        return
    }

    if (battleState.machineTeam.length !== 3) {
        showMessage('The machine could not build its team. Try again!')
        setBattleButton('START 3x3', false, false)
        return
    }

    if (!pokemon1 || !pokemon2 || !pokemon1.ready || !pokemon2.ready) {
        showMessage('Choose 3 Pokemon before battle!')
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
    addBattleLog(`A máquina enviou ${pokemon2.name}!`)

    renderPokemon(pokemon1, 'player')
    await wait(1900)

    if (resetToken !== battleState.resetToken) {
        return
    }

    updateHpBar('player')
    addBattleLog(`${pokemon1.name} entrou em campo!`)

    updateTeamDots('player')
    updateTeamDots('opponent')

    addBattleLog('A batalha começou!')
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

    addBattleLog(`${attacker.name} usou ${move.displayName}!`)

    if (!checkMoveAccuracy(move)) {
        addBattleLog('O golpe errou!')
        battleState.currentTurn = defenderSide
        handleTurnChange()
        return
    }

    const damageData = calculateMoveDamage(attacker, defender, move)
    const damage = damageData.damage

    defender.currentHp = Math.max(defender.currentHp - damage, 0)
    updateHpBar(defenderSide)

    if (damageData.typeMultiplier > 1) {
        addBattleLog('Foi super efetivo!')
    } else if (damageData.typeMultiplier < 1) {
        addBattleLog('Foi pouco efetivo!')
    }

    addBattleLog(`${defender.name} perdeu ${damage} HP.`)

    if (defender.currentHp === 0) {
        addBattleLog(`${defender.name} foi derrotado!`)
        handlePokemonDefeated(defenderSide)
        return
    }

    battleState.currentTurn = defenderSide
    handleTurnChange()
}

const checkMoveAccuracy = (move) => {
    const accuracy = move.accuracy || 100

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

    const turnMoves = getRandomMoves(currentPokemon.moves, 4)

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
    addBattleLog('A máquina está pensando...')

    const delay = Math.floor(Math.random() * 401) + 800

    const thinkingTimer = setTimeout(() => {
        if (!isMachineTurn()) {
            battleState.machineThinking = false
            hideMachineMoveBubble()
            return
        }

        const machinePokemon = battleState.opponent
        const move = chooseRandomMachineMove(machinePokemon)

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

const chooseRandomMachineMove = (machinePokemon) => {
    return getRandomItem(getRandomMoves(machinePokemon.moves, 4))
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
    Object.keys(pokemonSides).forEach((side) => {
        const pokemonElement = document.getElementById(pokemonSides[side].pokemonId)

        if (pokemonElement) {
            pokemonElement.classList.toggle('activeTurn', side === battleState.currentTurn && !battleState.finished)
        }
    })
}

const addBattleLog = (message) => {
    const battleLog = document.getElementById('battleLog')

    if (!battleLog) {
        return
    }

    battleLog.innerHTML += `<p>${message}</p>`
    battleLog.scrollTop = battleLog.scrollHeight
}

const handlePokemonDefeated = async (defeatedSide) => {
    const defeatedPokemon = battleState[defeatedSide]

    defeatedPokemon.defeated = true
    updateTeamDots(defeatedSide)
    clearMoveButtons()
    hideMachineMoveBubble()

    if (defeatedSide === 'opponent') {
        if (!hasAlivePokemon(battleState.machineTeam)) {
            addBattleLog('Todos os Pokémon da máquina foram derrotados!')
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
        addBattleLog('Todos os seus Pokémon foram derrotados!')
        finishThreeVsThreeBattle('opponent')
        return
    }

    if (!await playPokemonDefeatSequence(defeatedSide, defeatedPokemon.name)) {
        return
    }

    battleState.waitingForPlayerSwitch = true
    addBattleLog('Escolha seu próximo Pokémon.')
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
        return
    }

    switchOptions.innerHTML = battleState.playerTeam.map((pokemon, index) => {
        if (pokemon.defeated || index === battleState.playerActiveIndex) {
            return ''
        }

        return `
            <button class="switchButton" onclick="switchPlayerPokemon(${index})">
                ${pokemon.name} HP ${pokemon.currentHp}/${pokemon.maxHp}
            </button>
        `
    }).join('')

    switchOptions.classList.add('active')
}

const hidePlayerSwitchOptions = () => {
    const switchOptions = document.getElementById('switchOptions')

    if (switchOptions) {
        switchOptions.classList.remove('active')
        switchOptions.innerHTML = ''
    }
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
    renderPokemon(pokemon, 'player')
    await wait(1900)
    updateHpBar('player')
    addBattleLog(`Você enviou ${pokemon.name}!`)
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
    renderPokemon(pokemon, 'opponent')
    await wait(1900)
    updateHpBar('opponent')
    addBattleLog(`A máquina enviou ${pokemon.name}!`)
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

    addBattleLog(winner === 'player' ? 'Você venceu a batalha 3x3!' : 'A máquina venceu a batalha 3x3!')
    finishBattle(winnerSide)
}

const finishBattle = (winnerSide) => {
    const winner = battleState[winnerSide]
    const loserSide = getOpponentSide(winnerSide)

    battleState.finished = true
    battleState.machineThinking = false
    battleState.currentTurn = null
    updateTurnIndicator()
    addBattleLog(`${winner.name} venceu a batalha!`)

    if (winnerSide === 'opponent') {
        playSound('lose')
    } else {
        playSound('win')
    }

    animateDefeat(loserSide, winnerSide === 'player' ? 'You won' : 'You lose')
    showFinalTrainerResult(winnerSide)
    hideMachineMoveBubble()
    clearMoveButtons()
    hidePlayerSwitchOptions()
    setBattleButton('NEW BATTLE', false, false)
    setBattleMenuMode('finished')
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

    if (!container) {
        return
    }

    const trainerImage = winnerSide === 'player'
        ? '../../assets/img/ash_win.png'
        : '../../assets/img/trainer_gale.png'
    const trainerAlt = winnerSide === 'player' ? 'Ash won' : 'Trainer Gale won'
    const resultClass = winnerSide === 'player' ? 'playerResult' : 'machineResult'

    const resultTimer = setTimeout(() => {
        container.innerHTML = `
            <div class="battleResultTrainer ${resultClass}">
                <img src="${trainerImage}" alt="${trainerAlt}">
            </div>
        `
    }, 2000)

    battleTimers.push(resultTimer)
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

    clearSideTimers('player')
    clearSideTimers('opponent')
    clearBattleTimers()
    clearBattleLog()
    clearMoveButtons()
    hideMachineMoveBubble()
    clearMessage()
    hidePlayerSwitchOptions()
    clearBattleScreen()
    renderPlayerTeamSlots()
    renderTeamSummary()
    updateTeamDots('player')
    updateTeamDots('opponent')
    updateTurnIndicator()
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

const setBattleMenuMode = (mode) => {
    const menuTitle = document.querySelector('.txtMenu')
    const slots = document.getElementById('playerTeamSlots')
    const randomButton = document.querySelector('.randomTeamButton')
    const teamSummary = document.getElementById('teamSummary')
    const battlePanel = document.querySelector('.battlePanel')
    const isSetup = mode === 'setup'

    if (menuTitle) {
        menuTitle.style.display = isSetup ? 'block' : 'none'
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

        return `<img class="teamSummaryPokemon" src="${pokemon.sprites.front}" alt="${pokemon.name}" title="${pokemon.name}">`
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

const clearBattleScreen = () => {
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
        textScreen.style.display = 'block'
    }

    if (ball) {
        ball.style.display = 'inline-block'
    }

    if (power) {
        power.style.color = 'rgb(165, 165, 165)'
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

const formatMoveName = (value) => {
    return value
        .split('-')
        .map((word) => capitalize(word))
        .join(' ')
}

const playSound = (soundName) => {
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

const wait = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time))
}

const capitalize = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

window.addEventListener('load', () => {
    renderPlayerTeamSlots()
    renderTeamSummary()
    setBattleMenuMode('setup')
    updateStartButton()
    playSound('start')
})
