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


function initEditSkinPreview(){
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container--Edit"),
		width: 300,
        height: 400,
        skin: "data:image/png;base64,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"
	});



	// Control objects with your mouse!
	let control = skinview3d.createOrbitControls(skinViewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	// // Add an animation
    // let walk = skinViewer.animations.add(skinview3d.WalkingAnimation);

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.speed = .55


}



function initAddSkinPreview(){
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container--New"),
		width: 300,
        height: 400,
        skin: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAZlBMVEUAAAAAAAAAAAAAAAAAAAA0YwU3aQVDKRdEKhhFKRdFKxpHLBpKLhxNMyFNMyJONCJSNiVSNyVTOCVUOSdrYl2Ed26Kg3+NhoKSiIKTjoiUjIaXkIqeof//OTn/uV7/vJn/+vX///9didjKAAAABHRSTlMAAQMLDq6G5gAAAOpJREFUWMPtl9sOgyAMQHVDdnGi7n5Rq///kyMRZGLdhGQ+mB6TSpCcSKmiQaBgFoErJOgJABAB652+CEAxvG6ip4Cp8GPuaC50E0uPHljJow1YMnULSS8zBpm8io2shjGNTaGpGgAZnJezS14DKngK2vwz5i+ALnhOAaAskXuYVMaR5HPwJT4keZyfI4Xu5xKsyGxBeE+yzTZLrp6CcPUU+V4IcfMThKv1Kz2lx136mCSIEDivi6LmvG330X0kmEEgWZwALAaPsy7n+QUEQRAu3wuju/JCBfhr3kACEngJnHdlXcb2b+DfBG/z7DkpLJysqgAAAABJRU5ErkJggg=="
	});



	// Control objects with your mouse!
	let control = skinview3d.createOrbitControls(skinViewer);
	control.enableRotate = true;
	control.enableZoom = false;
	control.enablePan = false;

	// // Add an animation
    // let walk = skinViewer.animations.add(skinview3d.WalkingAnimation);

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.speed = .55


}


initAddSkinPreview();
initEditSkinPreview();

// async function generateSkinModel(skin) {
//     const skinViewer = new skinview3d.SkinViewer({
//         width: 288,
//         height: 384,
//         renderPaused: true
//     })

//     setCamera(skinViewer.camera)

//     // Add an animation
//     const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
//     walk.paused = true
//     walk.progress = 0.483

//     await skinViewer.loadSkin(skin)
//     skinViewer.render()
//     const image = skinViewer.canvas.toDataURL()
    
//     skinViewer.dispose()

//     return image
// }

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


$('.closeAddNewSkin').on('click', function(){
    $('#addNewSkinContent').fadeOut();
    return false;
}); 

$('.selectSkin__addNew').on('click', function(){
    $('#addNewSkinContent').fadeIn();
    return false;
}); 

$('.closeEdit').on('click', function(){
    $('#editSkinContent').fadeOut();
    return false;
}); 

$('.selectSkin__btn__inner--edit').on('click', function(){
    $('#editSkinContent').fadeIn();
    return false;
}); 


$('.selectSkin__btn--other').on('click', function(){
    $('.selectSkin__btn__inner').toggleClass('is-view');
    return false;
}); 


$('.deleteSkinBox').on('click', function(){
    console.log('削除ボタンをおしたよ');
    $(this).parents('.selectSkin__item').remove(); 
    return false;
}); 


$('.copySkinBox').on('click', function(){
    console.log('複製ボタンをおしたよ');
    $(this).parents('.selectSkin__item').clone().prependTo('.selectSkin__Wrap'); 
    return false;
}); 


// var exp = {};

// // returns "alex" or "steve" calculated by the +uuid+
// exp.default_skin = function(uuid) {
//     if (uuid.length <= 16) {
//       // we can't get the skin type by username
//       return "steve";
//     } else {
//       // great thanks to Minecrell for research into Minecraft and Java's UUID hashing!
//       // https://git.io/xJpV
//       // MC uses `uuid.hashCode() & 1` for alex
//       // that can be compacted to counting the LSBs of every 4th byte in the UUID
//       // an odd sum means alex, an even sum means steve
//       // XOR-ing all the LSBs gives us 1 for alex and 0 for steve
//       var lsbs_even = parseInt(uuid[ 7], 16) ^
//                       parseInt(uuid[15], 16) ^
//                       parseInt(uuid[23], 16) ^
//                       parseInt(uuid[31], 16);
//       return lsbs_even ? "alex" : "steve";
//     }
//   };