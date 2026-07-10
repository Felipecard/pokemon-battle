window.BATTLE_LOGIC = (() => {
    const shuffleList = (list) => {
        return [...list].sort(() => Math.random() - 0.5)
    }

    const getRandomItem = (list) => {
        return list[Math.floor(Math.random() * list.length)]
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
        const typeChart = window.BATTLE_CONFIG.typeChart

        return typeChart[moveType] && typeChart[moveType][defenderType] !== undefined
            ? typeChart[moveType][defenderType]
            : 1
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

    const getOpponentSide = (side) => {
        return side === 'player' ? 'opponent' : 'player'
    }

    const getPlayerTurnMoves = (pokemon, fallbackMove) => {
        const moves = pokemon.moves && pokemon.moves.length ? pokemon.moves : [fallbackMove]
        return shuffleList(moves).slice(0, 4)
    }

    const getMachineTurnMoves = (pokemon, fallbackMove) => {
        const moves = pokemon.moves && pokemon.moves.length ? pokemon.moves : [fallbackMove]
        const selectedMoves = shuffleList(moves).slice(0, 4)

        return selectedMoves.length ? selectedMoves : [fallbackMove]
    }

    const chooseMachineMove = (machinePokemon, playerPokemon, difficulty, fallbackMove) => {
        const turnMoves = getMachineTurnMoves(machinePokemon, fallbackMove)

        if (difficulty === 'easy') {
            console.log('easy: random move')
            return chooseRandomMove(turnMoves, fallbackMove)
        }

        if (difficulty === 'hard') {
            console.log('hard: best expected damage from turn moves')
            return chooseBestExpectedDamageMove(machinePokemon, playerPokemon, turnMoves, fallbackMove)
        }

        if (Math.random() < 0.5) {
            console.log('medium: best move from turn moves')
            return chooseBestExpectedDamageMove(machinePokemon, playerPokemon, turnMoves, fallbackMove)
        }

        console.log('medium: random move')
        return chooseRandomMove(turnMoves, fallbackMove)
    }

    const chooseRandomMove = (moves, fallbackMove) => {
        return getRandomItem(moves) || fallbackMove
    }

    const chooseBestExpectedDamageMove = (attacker, defender, turnMoves, fallbackMove) => {
        const moves = getAvailableDamageMoves(attacker, turnMoves, fallbackMove)

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

    const getAvailableDamageMoves = (pokemon, turnMoves = null, fallbackMove) => {
        const moves = turnMoves || (pokemon.moves && pokemon.moves.length ? pokemon.moves : [])

        if (turnMoves) {
            return moves.length ? moves : [fallbackMove]
        }

        const damageMoves = moves.filter((move) => move.power > 0)

        return damageMoves.length ? damageMoves : [fallbackMove]
    }

    const getFirstTurnMessage = (currentPokemon, opponentPokemon) => {
        if (currentPokemon.stats.speed === opponentPokemon.stats.speed) {
            return `${currentPokemon.name} starts by luck after a speed tie!`
        }

        return `${currentPokemon.name} starts for being faster!`
    }

    return {
        checkMoveAccuracy,
        calculateMoveDamage,
        getTypeMultiplier,
        chooseFirstTurn,
        getOpponentSide,
        getPlayerTurnMoves,
        getMachineTurnMoves,
        chooseMachineMove,
        chooseRandomMove,
        chooseBestExpectedDamageMove,
        calculateExpectedDamage,
        getAvailableDamageMoves,
        getFirstTurnMessage
    }
})()
