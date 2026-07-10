window.BATTLE_RENDER = (() => {
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

    const clearBattleLog = () => {
        const battleLog = document.getElementById('battleLog')

        if (battleLog) {
            battleLog.innerHTML = ''
        }
    }

    const clearMessage = () => {
        document.getElementById('winner').innerHTML = ''
    }

    const showMessage = (message, type = 'info') => {
        addBattleLog(message, type)
    }

    const updateStartButton = ({ isBattleStarted, disabled }) => {
        const button = document.querySelector('.toBattle')

        if (button && !isBattleStarted) {
            button.disabled = disabled
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

    const setSearchControls = (disabled, isBattleStarted) => {
        const controls = document.querySelectorAll('.teamSlotInput, .teamSlotAdd, .teamSlotRandom, .teamSlotRemove')
        const shouldDisable = disabled || isBattleStarted

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

    const updatePotionControl = ({ count, disabled, empty }) => {
        const potionControl = document.getElementById('potionControl')
        const potionCount = document.getElementById('potionCount')

        if (!potionControl || !potionCount) {
            return
        }

        potionCount.textContent = `x${count}`
        potionControl.disabled = disabled
        potionControl.classList.toggle('empty', empty)
    }

    const flashPokemonHeal = (pokemonId) => {
        const pokemonElement = document.getElementById(pokemonId)

        if (!pokemonElement) {
            return
        }

        pokemonElement.classList.remove('potionHealFlash')
        void pokemonElement.offsetWidth
        pokemonElement.classList.add('potionHealFlash')
    }

    const updateAiDifficultyButtons = (difficulty) => {
        const buttons = document.querySelectorAll('.aiDifficultyButton')

        buttons.forEach((button) => {
            button.classList.toggle('active', button.dataset.aiDifficulty === difficulty)
        })
    }

    const clearContainer = (containerId) => {
        const container = document.getElementById(containerId)

        if (container) {
            container.innerHTML = ''
        }
    }

    const setBattleMenuMode = ({ isSetup }) => {
        const menuTitle = document.querySelector('.txtMenu')
        const slots = document.getElementById('playerTeamSlots')
        const randomButton = document.querySelector('.randomTeamButton')
        const teamSummary = document.getElementById('teamSummary')
        const potionControl = document.getElementById('potionControl')
        const battlePanel = document.querySelector('.battlePanel')

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
            teamSummary.style.display = isSetup ? 'none' : 'flex'
        }

        if (potionControl) {
            potionControl.style.display = isSetup ? 'none' : 'inline-flex'
        }

        if (battlePanel) {
            battlePanel.classList.toggle('battlePanelActive', !isSetup)
        }
    }

    const renderPlayerTeamSlots = ({ team, slotIndexes }) => {
        const slots = document.getElementById('playerTeamSlots')

        if (!slots) {
            return
        }

        slots.innerHTML = slotIndexes.map((index) => {
            const pokemon = team[index]

            if (!pokemon) {
                return `
                    <div class="teamSlot teamSlotEmpty">
                        <span>Slot ${index + 1}</span>
                        <div class="teamSlotForm">
                            <input class="teamSlotInput" id="teamSlotInput${index}" type="text" placeholder="Pok name or number" onkeydown="handleTeamSlotKey(event, ${index})">
                            <button class="teamSlotRandom" type="button" onclick="chooseRandomPokemonForSlot(${index})" title="Random Pokemon">🎲</button>
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

    const renderTeamSummary = ({ team, slotIndexes, activeIndex, waitingForPlayerSwitch }) => {
        const teamSummary = document.getElementById('teamSummary')

        if (!teamSummary) {
            return
        }

        const teamSprites = slotIndexes.map((index) => {
            const pokemon = team[index]

            if (!pokemon) {
                return ''
            }

            const isActive = index === activeIndex
            const isSelectable = waitingForPlayerSwitch && !pokemon.defeated && !isActive
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

    const clearSwitchOptions = () => {
        const switchOptions = document.getElementById('switchOptions')

        if (!switchOptions) {
            return false
        }

        switchOptions.classList.remove('active')
        switchOptions.innerHTML = ''

        return true
    }

    const renderMoveButtons = ({ moves, onMoveClick }) => {
        const moveButtons = document.getElementById('moveButtons')

        if (!moveButtons) {
            return false
        }

        moveButtons.innerHTML = moves.map((move, index) => `
            <button class="moveButton" data-move-index="${index}">
                ${move.displayName}
            </button>
        `).join('')

        moveButtons.querySelectorAll('.moveButton').forEach((button) => {
            button.addEventListener('click', () => {
                const moveIndex = parseInt(button.dataset.moveIndex)
                onMoveClick(moves[moveIndex])
            })
        })

        return true
    }

    const clearMoveButtons = () => {
        const moveButtons = document.getElementById('moveButtons')

        if (moveButtons) {
            moveButtons.innerHTML = ''
        }
    }

    const showMachineMoveBubble = ({ pokemonName, moveName }) => {
        const bubble = document.getElementById('machineMoveBubble')

        if (!bubble) {
            return
        }

        bubble.textContent = `${pokemonName} used ${moveName}!`
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

    const updateTurnIndicator = ({ sides, currentTurn, finished }) => {
        Object.keys(sides).forEach((side) => {
            const pokemonElement = document.getElementById(sides[side].pokemonId)

            if (pokemonElement) {
                pokemonElement.classList.toggle('activeTurn', side === currentTurn && !finished)
            }
        })
    }

    const updateHpBar = ({ pokemon, pokemonId, lifeClass, fromHp = null, registerTimer }) => {
        const pokemonElement = document.getElementById(pokemonId)
        const lifeBar = pokemonElement && pokemonElement.querySelector(`.${lifeClass}`)
        const hpText = pokemonElement && pokemonElement.querySelector('.hpText')

        if (!pokemon || !pokemonElement || !lifeBar || !hpText) {
            return
        }

        const startHp = fromHp === null ? pokemon.currentHp : fromHp
        const endHp = pokemon.currentHp

        animateHpBar({ pokemon, lifeBar, hpText, startHp, endHp, registerTimer })
    }

    const animateHpBar = ({ pokemon, lifeBar, hpText, startHp, endHp, registerTimer = () => {} }) => {
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
            registerTimer(timer)
        }

        renderHpStep()
    }

    const animatePokemonFaint = ({ containerId, smokeClass, registerTimer, initialDelay = 0 }) => {
        const container = document.getElementById(containerId)

        if (!container) {
            return false
        }

        renderSmokeSequence({ container, smokeClass, registerTimer, initialDelay })

        return true
    }

    const showPokemonDefeatedMessage = ({ containerId, pokemonName }) => {
        const container = document.getElementById(containerId)

        if (!container) {
            return false
        }

        container.innerHTML = `
            <div class="defeatedMessage">
                ${pokemonName} fainted!
            </div>
        `

        return true
    }

    const animateBattleResult = ({ containerId, smokeClass, resultMessage, registerTimer }) => {
        const container = document.getElementById(containerId)

        if (!container) {
            return false
        }

        renderSmokeSequence({ container, smokeClass, registerTimer, initialDelay: 400 })

        const winnerTimer = setTimeout(() => {
            container.innerHTML = `
                <marquee direction="right" behavior="alternate" class="winnerMensage">
                    ${resultMessage}
                </marquee>
            `
        }, 1700)

        registerTimer(winnerTimer)

        return true
    }

    const renderSmokeSequence = ({ container, smokeClass, registerTimer = () => {}, initialDelay = 0 }) => {
        const smokeImages = [1, 2, 3]

        smokeImages.forEach((image, index) => {
            const timer = setTimeout(() => {
                container.innerHTML = `<img class='${smokeClass}' src='../../assets/img/smoke${image}.png'>`
            }, initialDelay + index * 400)

            registerTimer(timer)
        })
    }

    const getPokemonMarkup = ({ pokemon, settings }) => {
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

    const renderPokemon = ({ pokemon, settings, registerTimer = () => {}, onReady = () => {} }) => {
        const container = document.getElementById(settings.containerId)

        if (!container) {
            return false
        }

        const power = document.querySelector('#powerId')
        const textScreen = document.querySelector('#textScreen')
        const ball = document.querySelector('#ball')

        if (power) {
            power.style.color = 'rgb(121, 255, 121)'
        }

        if (textScreen) {
            textScreen.style.display = 'none'
        }

        if (ball) {
            ball.style.display = 'none'
        }

        settings.entryFrames.forEach((frame) => {
            const timer = setTimeout(() => {
                container.innerHTML = `<img class='${frame.className}' src='${getBallImage(frame.image)}'>`
            }, frame.delay)

            registerTimer(timer)
        })

        const readyTimer = setTimeout(() => {
            container.innerHTML = getPokemonMarkup({ pokemon, settings })
            onReady()
        }, 1800)

        registerTimer(readyTimer)

        return true
    }

    const getBallImage = (image) => {
        return `../../assets/img/ballOpen${image}.png`
    }

    const updateTeamDots = ({ side, team, isStarted }) => {
        const dotsElement = document.getElementById(side === 'player' ? 'playerTeamDots' : 'machineTeamDots')

        if (!dotsElement) {
            return
        }

        if (!isStarted) {
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

    const hideTrainerIntro = () => {
        const textScreen = document.getElementById('textScreen')

        if (textScreen) {
            textScreen.style.display = 'none'
        }
    }

    const renderJourneyWelcome = () => {
        const textScreen = document.getElementById('textScreen')

        if (!textScreen) {
            return false
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

        return true
    }

    const renderJourneyContinue = () => {
        const textScreen = document.getElementById('textScreen')

        if (!textScreen) {
            return false
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

        return true
    }

    const updateIdleBallMode = (isDesktop) => {
        const ball = document.getElementById('ball')

        if (!ball) {
            return
        }

        ball.classList.toggle('desktopIdleBall', isDesktop)
    }

    const updateContinueCounter = (remainingContinues) => {
        const continueCounter = document.getElementById('continueCounter')

        if (!continueCounter) {
            return
        }

        continueCounter.textContent = `CONTINUE x${remainingContinues}`
    }

    const renderTrainerIntro = ({ trainer, showChallenge, registerTimer }) => {
        const textScreen = document.getElementById('textScreen')

        if (!textScreen) {
            return false
        }

        if (!trainer) {
            textScreen.innerHTML = '<p class="galeIntroText">Journey complete!</p>'
            return true
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
            typeTrainerChallenge(trainer.challengeText, registerTimer)
        }

        return true
    }

    const typeTrainerChallenge = (text, registerTimer = () => {}) => {
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
            registerTimer(timer)
        }

        typeNextLetter()
    }

    const getJourneyProgressMarkup = ({ trainers, defeatedIndexes }) => {
        return `
            <p class="journeyProgressTitle">Next challenge:</p>
            <div class="journeyFaceRow">
                ${trainers.map((trainer) => {
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

    const clearBattleStage = ({ playerContainerId, opponentContainerId, hideBall }) => {
        const playerContainer = document.getElementById(playerContainerId)
        const opponentContainer = document.getElementById(opponentContainerId)
        const ball = document.getElementById('ball')

        if (playerContainer) {
            playerContainer.innerHTML = ''
        }

        if (opponentContainer) {
            opponentContainer.innerHTML = ''
        }

        if (ball && hideBall) {
            ball.style.display = 'none'
        }
    }

    const clearBattleScreen = ({ playerContainerId, opponentContainerId, showIdleBall, showWelcome }) => {
        const playerContainer = document.getElementById(playerContainerId)
        const opponentContainer = document.getElementById(opponentContainerId)
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

        inputs.forEach((input) => {
            input.value = ''
        })
    }

    const renderJourneyVictoryProgress = ({ trainerImage, trainerAlt, journeyProgress }) => {
        const textScreen = document.getElementById('textScreen')

        if (!textScreen) {
            return false
        }

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

        return true
    }

    const renderFinalTrainerResult = ({ containerId, trainerImage, trainerAlt, resultClass, fallbackText }) => {
        const container = document.getElementById(containerId)

        if (!container) {
            return false
        }

        container.innerHTML = `
            <div class="battleResultTrainer ${resultClass}">
                ${trainerImage ? `<img src="${trainerImage}" alt="${trainerAlt}">` : `<span>${fallbackText}</span>`}
            </div>
        `

        return true
    }

    const renderChampionCelebration = () => {
        const textScreen = document.getElementById('textScreen')

        if (!textScreen) {
            return false
        }

        textScreen.innerHTML = `
            <p class="championTitle">Congratulations, Champion!</p>
            <p class="championSubtitle">You defeated all 6 trainers and completed the journey.</p>
            <img src="../../assets/img/ash-champion.png" class="screenText championAsh" alt="Ash champion">
        `
        textScreen.style.display = 'block'

        return true
    }

    const capitalize = (value) => {
        return value.charAt(0).toUpperCase() + value.slice(1)
    }

    return {
        addBattleLog,
        getBattleLogClass,
        clearBattleLog,
        clearMessage,
        showMessage,
        updateStartButton,
        setBattleButton,
        setSearchControls,
        setRandomTeamButton,
        updatePotionControl,
        flashPokemonHeal,
        updateAiDifficultyButtons,
        clearContainer,
        setBattleMenuMode,
        renderPlayerTeamSlots,
        renderTeamSummary,
        clearSwitchOptions,
        renderMoveButtons,
        clearMoveButtons,
        showMachineMoveBubble,
        hideMachineMoveBubble,
        updateTurnIndicator,
        updateHpBar,
        animatePokemonFaint,
        showPokemonDefeatedMessage,
        animateBattleResult,
        getPokemonMarkup,
        renderPokemon,
        updateTeamDots,
        hideTrainerIntro,
        renderJourneyWelcome,
        renderJourneyContinue,
        updateIdleBallMode,
        updateContinueCounter,
        renderTrainerIntro,
        getJourneyProgressMarkup,
        clearBattleStage,
        clearBattleScreen,
        renderJourneyVictoryProgress,
        renderFinalTrainerResult,
        renderChampionCelebration
    }
})()
