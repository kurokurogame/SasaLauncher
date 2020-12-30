function setCamera(camera) {
    camera.rotation.x = 0.0684457336043845
    camera.rotation.y = -0.4075532917126465
    camera.rotation.z = 0.027165200024919168
    camera.position.x = -23.781852599545154
    camera.position.y = -11.767431171758776
    camera.position.z = 54.956618794277766
}

function initSkinViewer() {
    const skinViewer = new skinview3d.SkinViewer({
        canvas: document.getElementById('skin_container'),
        width: 288,
        height: 384
    })

    // Control objects with your mouse!
    const control = skinview3d.createOrbitControls(skinViewer)
    control.enableRotate = true
    control.enableZoom = false
    control.enablePan = false

    setCamera(skinViewer.camera)

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.speed = .55

    return skinViewer
}

const skinViewer = initSkinViewer()
skinViewer.loadSkin('data:image/png;base64,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')
    .then(() => skinViewer.render())

async function generateSkinModel(skin) {
    const skinViewer = new skinview3d.SkinViewer({
        width: 288,
        height: 384,
        renderPaused: true
    })

    setCamera(skinViewer.camera)

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.paused = true
    walk.progress = 0.483

    await skinViewer.loadSkin(skin)
    skinViewer.render()
    const image = skinViewer.canvas.toDataURL()
    
    skinViewer.dispose()

    return image
}

/**
 * Add auth account elements for each one stored in the authentication database.
 */
function populateAuthAccounts(){
    const authAccounts = ConfigManager.getAuthAccounts()
    const authKeys = Object.keys(authAccounts)
    if(authKeys.length === 0){
        return
    }
    const selectedUUID = ConfigManager.getSelectedAccount().uuid

    let authAccountStr = ''

    authKeys.map((val) => {
        const acc = authAccounts[val]
        authAccountStr += `<div class="settingsAuthAccount" uuid="${acc.uuid}">
            <div class="settingsAuthAccountLeft">
                <img class="settingsAuthAccountImage" alt="${acc.displayName}" src="https://crafatar.com/renders/body/${acc.uuid}?scale=3&default=MHF_Steve&overlay">
            </div>
            <div class="settingsAuthAccountRight">
                <div class="settingsAuthAccountDetails">
                    <div class="settingsAuthAccountDetailPane">
                        <div class="settingsAuthAccountDetailTitle">Username</div>
                        <div class="settingsAuthAccountDetailValue">${acc.displayName}</div>
                    </div>
                    <div class="settingsAuthAccountDetailPane">
                        <div class="settingsAuthAccountDetailTitle">UUID</div>
                        <div class="settingsAuthAccountDetailValue">${acc.uuid}</div>
                    </div>
                </div>
                <div class="settingsAuthAccountActions">
                    <button class="settingsAuthAccountSelect" ${selectedUUID === acc.uuid ? 'selected>選択中のアカウント &#10004;' : '>このアカウントを選択する'}</button>
                    <div class="settingsAuthAccountWrapper">
                        <button class="settingsAuthAccountLogOut">ログアウト</button>
                    </div>
                </div>
            </div>
        </div>`
    })

    settingsCurrentAccounts.innerHTML = authAccountStr
}

function initSkinList() {

}