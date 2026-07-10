window.BATTLE_CONFIG = {
    aiDifficultyLabels: {
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
    },

    teamDifficultyProfiles: {
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
    },

    journey: {
        isJourneyMode: true,
        maxContinues: 2,
        maxPotions: 6,
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
    },

    soundSources: {
        start: '../../assets/sounds/start.mp3',
        choose: '../../assets/sounds/choose.mp3',
        attack: '../../assets/sounds/choose_atack.mp3',
        failAttack: '../../assets/sounds/fail-atack.mp3',
        glug: '../../assets/sounds/glug.mp3',
        cry: '../../assets/sounds/cry.mp3',
        deathPok: '../../assets/sounds/death-pok.mp3',
        pokeballOpen: '../../assets/sounds/throw-pokeball.mp3',
        songBattle: '../../assets/sounds/song-battle.mp3',
        finishGame: '../../assets/sounds/finish-game-congrats.mp3',
        xEnter: '../../assets/sounds/x-enter.mp3',
        lose: '../../assets/sounds/lost-battle.mp3',
        win: '../../assets/sounds/victory.mp3'
    },

    typeChart: {
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
    },

    teamSize: 3,
    maxMachinePokemonId: 251
}
