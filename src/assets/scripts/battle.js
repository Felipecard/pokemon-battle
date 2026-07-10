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
    resetToken: 0
}

const battleConfig = window.BATTLE_CONFIG
const cloneStaticData = (data) => JSON.parse(JSON.stringify(data))
const aiDifficultyLabels = battleConfig.aiDifficultyLabels
const teamDifficultyProfiles = battleConfig.teamDifficultyProfiles
const {
    checkMoveAccuracy,
    calculateMoveDamage,
    getTypeMultiplier,
    chooseFirstTurn,
    getOpponentSide
} = window.BATTLE_LOGIC
const {
    addBattleLog,
    clearBattleLog,
    clearMessage,
    showMessage
} = window.BATTLE_RENDER
const {
    getPokemon,
    getPokemonMoves,
    getFallbackMove,
    normalizePokemon,
    calculatePokemonPower
} = window.POKEMON_API

const journeyState = {
    isJourneyMode: battleConfig.journey.isJourneyMode,
    currentTrainerIndex: 0,
    completedTrainers: [],
    continueUsed: 0,
    maxContinues: battleConfig.journey.maxContinues,
    potionsUsed: 0,
    maxPotions: battleConfig.journey.maxPotions,
    phase: 'setup',
    result: null,
    trainers: cloneStaticData(battleConfig.journey.trainers)
}

const pokemonCandidateCache = {}
const teamSize = battleConfig.teamSize
const maxMachinePokemonId = battleConfig.maxMachinePokemonId

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
    window.BATTLE_RENDER.renderPlayerTeamSlots({
        team: battleState.playerTeam,
        slotIndexes: getTeamSlotIndexes()
    })
}

const updateStartButton = () => {
    window.BATTLE_RENDER.updateStartButton({
        isBattleStarted: battleState.started,
        disabled: !isPlayerTeamComplete() || battleState.selectingMachine
    })
}

const chooseRandomPokemonForSlot = async (slotIndex) => {
    if (battleState.started || battleState.playerTeam[slotIndex] || battleState.selectingMachine) {
        return
    }

    const resetToken = battleState.resetToken

    try {
        setSearchControls(true)
        clearMessage()

        const pokemonId = getRandomAvailablePokemonId()
        const data = await getPokemon(pokemonId.toString())
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
        showMessage('Could not choose a random Pokemon!', 'error')
        console.log(err)
        setSearchControls(false)
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

const getRandomAvailablePokemonId = () => {
    const usedIds = new Set(battleState.playerTeam.filter(Boolean).map((pokemon) => pokemon.id))
    let pokemonId = getRandomPokemonId()

    while (usedIds.has(pokemonId)) {
        pokemonId = getRandomPokemonId()
    }

    return pokemonId
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
        window.BATTLE_RENDER.clearContainer(settings.containerId)
        showMessage('Pokemon not found!', 'error')
        setSearchControls(false)
        console.log(err)
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
    return window.BATTLE_LOGIC.getPlayerTurnMoves(pokemon, getFallbackMove())
}

const shuffleList = (list) => {
    return [...list].sort(() => Math.random() - 0.5)
}

const getRandomItem = (list) => {
    return list[Math.floor(Math.random() * list.length)]
}

const renderPokemon = (pokemon, side) => {
    const settings = pokemonSides[side]

    clearSideTimers(side)

    window.BATTLE_RENDER.renderPokemon({
        pokemon,
        settings,
        registerTimer: (timer) => {
            renderTimers[side].push(timer)
        },
        onReady: () => {
            pokemon.ready = true
        }
    })
}

const selectMachinePokemon = async (playerPokemon) => {
    battleState.selectingMachine = true
    battleState.opponent = null
    clearSideTimers('opponent')
    window.BATTLE_RENDER.clearContainer(pokemonSides.opponent.containerId)
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
    const remainingPotions = getRemainingPotions()

    window.BATTLE_RENDER.updatePotionControl({
        count: remainingPotions,
        disabled: !canUsePotion(),
        empty: remainingPotions <= 0
    })
}

const flashPlayerPotionHeal = () => {
    window.BATTLE_RENDER.flashPokemonHeal(pokemonSides.player.pokemonId)
}

const renderMoveButtons = () => {
    const currentPokemon = battleState[battleState.currentTurn]

    if (!currentPokemon || battleState.finished || isMachineTurn()) {
        clearMoveButtons()
        return
    }

    hideMachineMoveBubble()

    const turnMoves = getPlayerTurnMoves(currentPokemon)

    window.BATTLE_RENDER.renderMoveButtons({
        moves: turnMoves,
        onMoveClick: (move) => {
            playSound('attack')
            executeMove(move)
        }
    })
}

const clearMoveButtons = () => {
    window.BATTLE_RENDER.clearMoveButtons()
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
    window.BATTLE_RENDER.updateAiDifficultyButtons(getAiDifficulty())
}

const chooseMachineMove = (machinePokemon, playerPokemon) => {
    return window.BATTLE_LOGIC.chooseMachineMove(machinePokemon, playerPokemon, getAiDifficulty(), getFallbackMove())
}

const showMachineMoveBubble = (pokemon, move) => {
    window.BATTLE_RENDER.showMachineMoveBubble({
        pokemonName: pokemon.name,
        moveName: move.displayName
    })
}

const hideMachineMoveBubble = () => {
    window.BATTLE_RENDER.hideMachineMoveBubble()
}

const updateHpBar = (side, fromHp = null) => {
    const pokemon = battleState[side]
    const settings = pokemonSides[side]

    if (!pokemon || !settings) {
        return
    }

    window.BATTLE_RENDER.updateHpBar({
        pokemon,
        pokemonId: settings.pokemonId,
        lifeClass: settings.lifeClass,
        fromHp,
        registerTimer: (timer) => {
            battleTimers.push(timer)
        }
    })
}

const updateTurnIndicator = () => {
    window.BATTLE_RENDER.updateTurnIndicator({
        sides: pokemonSides,
        currentTurn: battleState.currentTurn,
        finished: battleState.finished
    })
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
    if (!window.BATTLE_RENDER.clearSwitchOptions()) {
        renderTeamSummary()
        updatePotionControl()
        return
    }

    renderTeamSummary()
    updatePotionControl()
}

const hidePlayerSwitchOptions = () => {
    window.BATTLE_RENDER.clearSwitchOptions()
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

    window.BATTLE_RENDER.animatePokemonFaint({
        containerId: settings.containerId,
        smokeClass: settings.smokeClass,
        registerTimer: (timer) => {
            battleTimers.push(timer)
        }
    })
}

const showPokemonDefeatedMessage = (side, pokemonName) => {
    const settings = pokemonSides[side]

    window.BATTLE_RENDER.showPokemonDefeatedMessage({
        containerId: settings.containerId,
        pokemonName
    })
}

const resetTurnAfterSwitch = () => {
    battleState.currentTurn = chooseFirstTurn(battleState.player, battleState.opponent)
    addBattleLog(getFirstTurnMessage())
    handleTurnChange()
}

const updateTeamDots = (side) => {
    window.BATTLE_RENDER.updateTeamDots({
        side,
        team: side === 'player' ? battleState.playerTeam : battleState.machineTeam,
        isStarted: battleState.started
    })
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

    window.BATTLE_RENDER.animateBattleResult({
        containerId: settings.containerId,
        smokeClass: settings.smokeClass,
        resultMessage,
        registerTimer: (timer) => {
            battleTimers.push(timer)
        }
    })
}

const showFinalTrainerResult = (winnerSide) => {
    const settings = pokemonSides[winnerSide]
    const trainer = getCurrentTrainer()

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

        window.BATTLE_RENDER.renderFinalTrainerResult({
            containerId: settings.containerId,
            trainerImage,
            trainerAlt,
            resultClass,
            fallbackText: `${getOpponentTrainerName()} won`
        })
    }, 2000)

    battleTimers.push(resultTimer)
}

const showJourneyVictoryProgress = (trainerImage, trainerAlt, journeyProgress) => {
    battleState.started = false
    updateTeamDots('player')
    updateTeamDots('opponent')

    window.BATTLE_RENDER.clearBattleStage({
        playerContainerId: pokemonSides.player.containerId,
        opponentContainerId: pokemonSides.opponent.containerId,
        hideBall: true
    })

    if (window.BATTLE_RENDER.renderJourneyVictoryProgress({ trainerImage, trainerAlt, journeyProgress })) {
        const xSoundTimer = setTimeout(() => {
            playSound('xEnter')
        }, 1000)

        battleTimers.push(xSoundTimer)
    }
}

const showChampionCelebration = () => {
    battleState.started = false
    clearMoveButtons()
    hideMachineMoveBubble()
    hidePlayerSwitchOptions()
    updateTeamDots('player')
    updateTeamDots('opponent')

    window.BATTLE_RENDER.clearBattleStage({
        playerContainerId: pokemonSides.player.containerId,
        opponentContainerId: pokemonSides.opponent.containerId,
        hideBall: true
    })
    window.BATTLE_RENDER.renderChampionCelebration()
}

const getFirstTurnMessage = () => {
    const currentPokemon = battleState[battleState.currentTurn]
    const opponentPokemon = battleState[getOpponentSide(battleState.currentTurn)]

    return window.BATTLE_LOGIC.getFirstTurnMessage(currentPokemon, opponentPokemon)
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

const setBattleButton = (text, disabled, hidden) => {
    window.BATTLE_RENDER.setBattleButton(text, disabled, hidden)
}

const showTrainerIntro = (trainer) => {
    playSound('songBattle')
    updateScreenTrainerIntro(true, trainer)
}

const hideTrainerIntro = () => {
    window.BATTLE_RENDER.hideTrainerIntro()
}

const showJourneyWelcome = () => {
    window.BATTLE_RENDER.renderJourneyWelcome()
    updateIdleBallMode()
}

const showJourneyContinue = () => {
    window.BATTLE_RENDER.renderJourneyContinue()
    updateIdleBallMode()
}

const updateIdleBallMode = () => {
    window.BATTLE_RENDER.updateIdleBallMode(window.innerWidth > 1100)
}

const updateContinueCounter = () => {
    window.BATTLE_RENDER.updateContinueCounter(getRemainingContinues())
}

const getRemainingContinues = () => {
    return Math.max(journeyState.maxContinues - journeyState.continueUsed, 0)
}

const hasContinuesAvailable = () => {
    return getRemainingContinues() > 0
}

const updateScreenTrainerIntro = (showChallenge = false, selectedTrainer = getCurrentTrainer()) => {
    window.BATTLE_RENDER.renderTrainerIntro({
        trainer: selectedTrainer,
        showChallenge,
        registerTimer: (timer) => {
            battleTimers.push(timer)
        }
    })
}

const getJourneyProgressMarkup = () => {
    const defeatedIndexes = new Set([...journeyState.completedTrainers])
    const trainer = getCurrentTrainer()

    if (trainer) {
        defeatedIndexes.add(trainer.index)
    }

    return window.BATTLE_RENDER.getJourneyProgressMarkup({
        trainers: journeyState.trainers,
        defeatedIndexes
    })
}

const setBattleMenuMode = (mode) => {
    const isSetup = mode === 'setup'

    if (mode === 'setup') {
        showJourneyWelcome()
    }

    renderTeamSummary()
    updatePotionControl()
    window.BATTLE_RENDER.setBattleMenuMode({ isSetup })
}

const renderTeamSummary = () => {
    window.BATTLE_RENDER.renderTeamSummary({
        team: battleState.playerTeam,
        slotIndexes: getTeamSlotIndexes(),
        activeIndex: battleState.playerActiveIndex,
        waitingForPlayerSwitch: battleState.waitingForPlayerSwitch
    })
}

const setSearchControls = (disabled) => {
    window.BATTLE_RENDER.setSearchControls(disabled, battleState.started)
}

const setRandomTeamButton = (disabled) => {
    window.BATTLE_RENDER.setRandomTeamButton(disabled)
}

const clearBattleScreen = ({ showIdleBall = true, showWelcome = true } = {}) => {
    window.BATTLE_RENDER.clearBattleScreen({
        playerContainerId: pokemonSides.player.containerId,
        opponentContainerId: pokemonSides.opponent.containerId,
        showIdleBall,
        showWelcome
    })

    if (showWelcome) {
        showJourneyWelcome()
    }
}

const clearSideTimers = (side) => {
    renderTimers[side].forEach((timer) => clearTimeout(timer))
    renderTimers[side] = []
}

const clearBattleTimers = () => {
    battleTimers.forEach((timer) => clearTimeout(timer))
    battleTimers.length = 0
}

const wait = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time))
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
