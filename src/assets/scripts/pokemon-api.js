window.POKEMON_API = (() => {
    const pokemonApiCache = {}
    const moveDetailsCache = {}

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

    const shuffleList = (list) => {
        return [...list].sort(() => Math.random() - 0.5)
    }

    const formatMoveName = (value) => {
        return value
            .split('-')
            .map((word) => capitalize(word))
            .join(' ')
    }

    const capitalize = (value) => {
        return value.charAt(0).toUpperCase() + value.slice(1)
    }

    return {
        getPokemon,
        getPokemonMoves,
        getMoveDetails,
        getFallbackMove,
        normalizePokemon,
        calculatePokemonPower
    }
})()
