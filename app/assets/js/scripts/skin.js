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

const selectedUUID = ConfigManager.getSelectedAccount().uuid

const axiosBase = require('axios');
const axios = axiosBase.create({
    headers: {
        'Content-Type': 'application/json'
    } ,
    responseType: 'json'
});

axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${selectedUUID}`)
.then(function (response) {
    // handle success
    let base64Textures = ""
    response.data.properties.forEach(element => {
        if(element.name == "textures"){
            base64Textures = element.value;
        }
    });
    if (base64Textures != ""){
        const texturesJSON = atob(base64Textures);
        const textures = JSON.parse(texturesJSON);
        const skinURL = textures.textures.SKIN.url;
        console.log(skinURL);
        const skinViewer = initSkinViewer()
        skinViewer.loadSkin(skinURL)
            .then(() => skinViewer.render())
    }
})
.catch(function (error) {
    // handle error
  console.log(error);
})
.finally(function () {
    // always executed
});


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


var exp = {};

// returns "alex" or "steve" calculated by the +uuid+
exp.default_skin = function(uuid) {
    if (uuid.length <= 16) {
      // we can't get the skin type by username
      return "steve";
    } else {
      // great thanks to Minecrell for research into Minecraft and Java's UUID hashing!
      // https://git.io/xJpV
      // MC uses `uuid.hashCode() & 1` for alex
      // that can be compacted to counting the LSBs of every 4th byte in the UUID
      // an odd sum means alex, an even sum means steve
      // XOR-ing all the LSBs gives us 1 for alex and 0 for steve
      var lsbs_even = parseInt(uuid[ 7], 16) ^
                      parseInt(uuid[15], 16) ^
                      parseInt(uuid[23], 16) ^
                      parseInt(uuid[31], 16);
      return lsbs_even ? "alex" : "steve";
    }
  };