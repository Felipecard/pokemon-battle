const audioState = {
    muted: false
}

const sounds = Object.entries(window.BATTLE_CONFIG.soundSources).reduce((soundMap, [name, source]) => {
    soundMap[name] = new Audio(source)
    return soundMap
}, {})

const playSound = (soundName) => {
    if (audioState.muted) {
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
    audioState.muted = !audioState.muted

    if (audioState.muted) {
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

    button.classList.toggle('muted', audioState.muted)
    button.setAttribute('aria-pressed', audioState.muted ? 'true' : 'false')
}

window.BATTLE_AUDIO = {
    playSound,
    toggleMute,
    stopAllSounds,
    updateMuteButton,
    sounds,
    audioState
}

window.playSound = playSound
window.toggleMute = toggleMute
window.stopAllSounds = stopAllSounds
window.updateMuteButton = updateMuteButton
