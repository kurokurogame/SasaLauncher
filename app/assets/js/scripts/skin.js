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
        let model = 'classic';
        if (textures.textures.SKIN.hasOwnProperty('metadata')) {
            model = textures.textures.SKIN.metadata.model;
        } 
        
        update3dView (model, skinURL);
    }
})
.catch(function (error) {
    // handle error
  console.log(error);
})
.finally(function () {
    // always executed
});



function uploadSkin(variant, file, selectedUUID){
    AuthManager.validateSelected().then(()=>{
        
        const config = {
            headers: {
                Authorization: 'Bearer ' + ConfigManager.getAuthAccount(selectedUUID).accessToken
            }
        }

        const param = new FormData();
        if (variant == 'slim') {
            param.append('model',variant);
        }　else {
            param.append('model','');
        }
        param.append('file',file);
        axios.put(`https://api.mojang.com/user/profile/${selectedUUID}/skin`, param, config)
        .then(function (response) {
            // handle success
            console.log(response);
            const reader = new FileReader();
            reader.addEventListener("load", function () {
                const skinURL = reader.result;
                update3dView(variant, skinURL);
            }, false);
            if (file) {
                reader.readAsDataURL(file);
            }
        })
        .catch(function (error) {
            // handle error
          console.log(error);
        })
        .finally(function () {
            // always executed
        });
    })
}

/*
function changeSkin(skinURL, selectedUUID){
    AuthManager.validateSelected().then(()=>{
        const param = {
            variant: "classic",
            url: skinURL
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + ConfigManager.getAuthAccount(selectedUUID).accessToken
            }
        }
        console.log(param);
        axios.post(`https://api.mojang.com/user/profile/${selectedUUID}/skin`, param, config)
        // axios.post('https://api.minecraftservices.com/minecraft/profile/skins', param, config)
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
    })
}
*/

/*
function deleteSkin(selectedUUID){
    AuthManager.validateSelected().then(()=>{
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + ConfigManager.getAuthAccount(selectedUUID).accessToken
            }
        }
        axios.delete(`https://api.mojang.com/user/profile/${selectedUUID}/skin`, config)
        .then(function (response) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
    })
}
*/
function initEditSkinPreview(variant, skinURL){
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container--Edit"),
		width: 300,
        height: 400,
        skin: skinURL
	});
    const skinModel = variant == 'classic' ? 'default' : 'slim'
    skinViewer.loadSkin(skinURL, skinModel);


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

const steveSkinImage = 'data:image/png;base64,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'
const alexSkinImage = 'data:image/png;base64,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'


function updateAddSkinPreview(variant, skinURL) {
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container--New"),
		width: 300,
        height: 400,
        skin: skinURL
    });
    const skinModel = variant == 'classic' ? 'default' : 'slim'
    skinViewer.loadSkin(skinURL, skinModel);


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

//　現在のスキン
function update3dView(variant, skinURL){
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container"),
		width: 300,
        height: 400,
        skin: skinURL
    });
    const skinModel = variant == 'classic' ? 'default' : 'slim'
    skinViewer.loadSkin(skinURL, skinModel);


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

// 新しいスキンを追加するときの画面
function initAddSkinPreview(){
    updateAddSkinPreview('classic',steveSkinImage);
}





// initEditSkinPreview('classic',steveSkinImage);

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


function getLauncherSkinPath(){
    const {remote: remoteElectron} = require('electron');
    const app = remoteElectron.app;
    const appPath = app.getPath('appData');
    const homePath = app.getPath('home');

    switch(process.platform){
        case 'win32':
            return `${appPath}\\.minecraft\\launcher_skins.json`
        case 'darwin':
            return `${appPath}/minecraft/launcher_skins.json`
        case 'linux':
            return `${homePath}/.minecraft/launcher_skins.json`
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

fetch(getLauncherSkinPath())
.then(response => response.json())
.then(data => {
    Object.keys(data).forEach(function(key){
        const val = this[key];
        const created = val.created;
        const id = val.id;
        const modelImage = val.modelImage;
        const name = val.name;
        const skinImage = val.skinImage;
        const slim = val.slim;
        const textureId = val.textureId;
        const updated = val.updated;
        const skinItem = 
        `<div class="selectSkin__item">
            <p class="selectSkin__item__ttl">${name}</p>
            <div class="selectSkin__item__skinimg"><img src="${modelImage}">
            <div class="selectSkin__item__hover" style="display: none;">
                <div class="selectSkin__btn--use useSelectSkin" data-skinimage="${skinImage}">使用する</div>
                <div class="selectSkin__btn--other__wrap">
                    <div class="selectSkin__btn--other skinEditPanel">…</div>
                    <div class="selectSkin__btn__inner">
                        <div class="selectSkin__btn__inner--delete deleteSkinBox" data-id="${id}">削除</div>
                        <div class="selectSkin__btn__inner--copy copySkinBox" data-id="${id}">複製</div>
                        <div class="selectSkin__btn__inner--edit" data-id="${id}">編集</div>
                    </div>
                </div>
            </div>
        </div>`

        $(".selectSkin__Wrap").append(skinItem);

    }, data);
});

function changeSkinPickJson(key) {
    const fs = require('fs');
    const skinJSON = path.join(getLauncherSkinPath())
    const jsonObject = JSON.parse(fs.readFileSync(skinJSON, 'utf8'));
    const targetSkin = jsonObject[key] 

    return targetSkin;
}

$('.closeAddNewSkin, input.closeAddNewSkin').on('click', function(){
    $('#addNewSkinContent').fadeOut();
    $('input[type="file"]#skinUpBox').val(null);
    $('input[name="skinAddName"]').val("");
    $('input[name="skinAddModel"][value="classic"]').prop('checked', true);
    $('input[name="skinAddModel"][value="slim"]').prop('checked', false);
    return false;
}); 

$('.selectSkin__addNew').on('click', function(){
    $('#addNewSkinContent').fadeIn();
    initAddSkinPreview();
    return false;
}); 

$('.closeEdit, input.closeEdit').on('click', function(){
    $('#editSkinContent').fadeOut();
    $('input[type="file"]#skinEditBox').val(null);
    $('input[name="skinEditName"]').val("");
    // $('input[name="skinEditModel"][value="classic"]').prop('checked', true);
    // $('input[name="skinEditModel"][value="slim"]').prop('checked', false);
    return false;
}); 


$('.selectSkin__Wrap').on('click','.skinEditPanel', function(){
    $(this).next('.selectSkin__btn__inner').toggleClass('is-view');
    
    return false;
}); 


$('.selectSkin__Wrap').on('click', '.deleteSkinBox', function(){
    $(this).parents('.selectSkin__item').remove(); 
    return false;
}); 


$('.selectSkin__Wrap').on('click', '.copySkinBox' , function(){
    $(this).parents('.selectSkin__item').clone().prependTo('.selectSkin__Wrap'); 
    return false;
}); 

let editSkinSelectedImage = ''

$('.selectSkin__Wrap').on('click', '.selectSkin__btn__inner--edit' , function(){
    $('#editSkinContent').fadeIn();
    const targetSkin = changeSkinPickJson($(this).data('id'));
    const created = targetSkin.created;
    const id = targetSkin.id;
    const modelImage = targetSkin.modelImage;
    const name = targetSkin.name;
    const skinImage = targetSkin.skinImage;
    const slim = targetSkin.slim;
    const textureId = targetSkin.textureId;
    const updated = targetSkin.updated;
    // console.log(name);
    $('input[name="skinEditName"]').val(name);
    let valiant = ''
    if (slim) {
        $('input[name="skinEditModel"][value="classic"]').prop('checked', false);
        $('input[name="skinEditModel"][value="slim"]').prop('checked', true);
        valiant = 'slim'
    } else {
        $('input[name="skinEditModel"][value="classic"]').prop('checked', true);
        $('input[name="skinEditModel"][value="slim"]').prop('checked', false);
        valiant = 'classic'
    }
    initEditSkinPreview(valiant,skinImage);
    editSkinSelectedImage = skinImage
    return false;
}); 

$('.selectSkin__Wrap').on('click', '.useSelectSkin' , function(){
    changeSkin($(this).data('skinimage'),selectedUUID);
    return false;
}); 
$('.selectSkin__Wrap').on('click', '.deleteSkinBox' , function(){
    deleteSkin($(this).data('skinimage'),selectedUUID);
    return false;
}); 
$('.saveAndUse').on('click' , function(){
    const variant = $('input:radio[name="skinAddModel"]:checked').val();
    const file = $('#skinUpBox').prop('files')[0];
    uploadSkin(variant, file, selectedUUID);
    return false;
}); 


$('#skinUpBox, #skinAddModelClassic, #skinAddModelSlim').on('change', function(){
    const variant = $('input:radio[name="skinAddModel"]:checked').val();
    const file = $('#skinUpBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        const skinURL = reader.result;
        updateAddSkinPreview(variant, skinURL);
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    } else {
        if(variant == 'classic' ){
            updateAddSkinPreview(variant, steveSkinImage);
        } else {
            updateAddSkinPreview(variant, alexSkinImage);
        }
    }
});
$('#skinEditBox, #skinEditModelClassic, #skinEditModelSlim').on('change', function(){
    const variant = $('input:radio[name="skinEditModel"]:checked').val();
    const file = $('#skinEditBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        const skinURL = reader.result;
        initEditSkinPreview(variant, skinURL);
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    } else {
        if(variant == 'classic' ){
            initEditSkinPreview(variant, editSkinSelectedImage);
        } else {
            initEditSkinPreview(variant, editSkinSelectedImage);
        }
    }
});

$('.editLauncherSkin__btn').on('click', function(){
    $('#editLauncherSkin').fadeIn();
    return false;
});

$('.closeEditLauncher').on('click', function(){
    $('#editLauncherSkin').fadeOut();
    return false;
}); 