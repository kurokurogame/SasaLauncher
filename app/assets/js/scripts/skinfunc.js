const skinOriginImg = require('./skinoriginimg');
const fs = require('fs');

function setCamera(camera) {
    camera.rotation.x = 0.0684457336043845
    camera.rotation.y = -0.4075532917126465
    camera.rotation.z = 0.027165200024919168
    camera.position.x = -23.781852599545154
    camera.position.y = -11.767431171758776
    camera.position.z = 54.956618794277766
}

const selectedUUID = ConfigManager.getSelectedAccount().uuid

const axiosBase = require('axios');
const axios = axiosBase.create({
    headers: {
        'Content-Type': 'application/json'
    } ,
    responseType: 'json'
});



/*----------------------
APIへの反映　GET
----------------------*/

// 3dview今着ているスキンの呼び出しAPI
async function getNowSkin() {
    try{
        const response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${selectedUUID}`)
        console.log(response);
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
            nowSkinPreview (model, skinURL);
        }
    }
    catch(error) {console.log(error);}
    finally {};
}

// TextureIDを取得するAPI
async function getTextureID() {
    let textureID = null;
    try{
        const response = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${selectedUUID}`)
        console.log(response);
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
            textureID = skinURL.replace("http://textures.minecraft.net/texture/", "");
            return textureID;
        }
    }
    catch(error) {console.log(error);}
    finally { 
        return textureID;
    };
}



/*----------------------
APIへの反映　PUT
----------------------*/

// 編集・追加したスキンに着替えるAPI
async function uploadSkin(variant, file){
    await AuthManager.validateSelected();
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
    try{
        const response = await axios.put(`https://api.mojang.com/user/profile/${selectedUUID}/skin`, param, config)
        console.log(response);
        const reader = new FileReader();
        reader.addEventListener("load", function () {
            const skinURL = reader.result;
            nowSkinPreview(variant, skinURL);
        }, false);
        if (file) {
            reader.readAsDataURL(file);
        }
    }
    catch(error) {console.log(error);}
    finally {};
}



/*----------------------
3dViewer / modelImage表示反映
----------------------*/

//　今着ているスキンのプレビュー
function nowSkinPreview(variant, skinURL){
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

// 新規追加画面のプレビュー
function addSkinPreview(variant, skinURL) {
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

// 編集画面のプレビュー
function editSkinPreview(variant, skinURL){
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

// ライブラリ一覧　モデルスキン生成
async function generateSkinModel(imageURL) {
    const skinViewer = new skinview3d.SkinViewer({
        width: 245,
        height: 354,
        renderPaused: true
    })

    setCamera(skinViewer.camera)

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.paused = true
    walk.progress = 0.483

    await skinViewer.loadSkin(imageURL)
    skinViewer.render()
    const image = skinViewer.canvas.toDataURL()
    skinViewer.dispose()

    return image
}



/*----------------------
ライブラリへのDOM表示関連
----------------------*/

// 一覧のDOM反映
async function exportLibrary() {
    const response = await fetch(getLauncherSkinPath())
    const data = await response.json();
    const datatArray = Object.keys(data).map(function (key) {return data[key]})
    datatArray.sort(function(a,b){
        if(a.updated > b.updated) return -1;
        if(a.updated < b.updated) return 1;
        return 0;
    });
    datatArray.forEach(function(val){
        const id = val.id;
        const modelImage = val.modelImage;
        let name = val.name;
        if (name == null) {
            name = '<名前のないスキン>'
        }
        const skinItem = 
        `<div class="selectSkin__item skinLibraryItem">
            <p class="selectSkin__item__ttl">${name}</p>
            <div class="selectSkin__item__skinimg"><img src="${modelImage}" />
            <div class="selectSkin__item__hover" style="display: none;">
                <div class="selectSkin__btn--use useSelectSkin" data-id="${id}">使用する</div>
                <div class="selectSkin__btn--other__wrap">
                    <div class="selectSkin__btn--other skinEditPanel">…</div>
                    <div class="selectSkin__btn__inner">
                        <div class="selectSkin__btn__inner--delete deleteSkinBox" data-id="${id}">削除</div>
                        <div class="selectSkin__btn__inner--copy copySkinBox" data-id="${id}" data-name="${name}">複製</div>
                        <div class="selectSkin__btn__inner--edit editSkinBox" data-id="${id}">編集</div>
                    </div>
                </div>
            </div>
        </div>`

        $(".selectSkin__Wrap").append(skinItem);        
    }, data);
    countCheck();
}

// 一覧のスキン名省略or空欄の代替
function countCheck(){
    $('.selectSkin__item__ttl').each(function(){
        const nameText = $(this).text();
        const trim = (str, maxLength) => {
            let len = 0;
            let output = '';
            for (let i = 0; i < str.length; i++) {
              (str[i].match(/[ -~]/)) ? len += 1 : len += 2;
              if (len < maxLength) {
                  output+=str[i];
              } else {
                  output+='...';
                  break;
              }
            }
            return output;
        }

        const maxLength = 20;
        if (nameText.length == 0 ) {
            $(this).text('<名前のないスキン>');
        } else {
            $(this).text(trim(nameText, maxLength))
        }
    });
};



/*----------------------
新しく追加する画面の初期化
----------------------*/

// 新しいスキンを追加するときの画面(初期化)
function initAddSkinPreview(){
    addSkinPreview('classic',skinOriginImg.steveSkinImage);
    $('#skinAddBox').val(null);
    $('#skinNewName').val(null);
    $('input[name="skinAddModel"][value="classic"]').prop('checked', true);
    $('input[name="skinAddModel"][value="slim"]').prop('checked', false);
}



/*----------------------
JSONファイルの読み込み・書き出し
----------------------*/

// 公式ランチャー内のスキンデータパスを取得する
function getLauncherSkinPath(){
    const {remote: remoteElectron} = require('electron');
    const app = remoteElectron.app;
    const appPath = app.getPath('appData');
    const homePath = app.getPath('home');

    switch(process.platform){
        case 'win32':
            return `${appPath}\\.minecraft\\launcher_skins.json`
        case 'darwin':
            return process.cwd() + '/app/assets/js/scripts/test.json'
            // return `${appPath}/minecraft/launcher_skins.json`
        case 'linux':
            return `${homePath}/.minecraft/launcher_skins.json`
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

// スキンのJSONを呼び出し・オブジェクトに変更
function loadSkins(){
    const skinJSON = path.join(getLauncherSkinPath())
    const jsonObject = JSON.parse(fs.readFileSync(skinJSON, 'utf8'));
    return jsonObject;
}

// JSONへの書き込み
function saveSkins(jsonObject){
    const skinJSON = path.join(getLauncherSkinPath())
    let json = JSON.stringify(jsonObject, null, 2)
    json  = json.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    })
    fs.writeFileSync(skinJSON,json);
}

//JSON指定したID（key）のスキン情報を取得
function changeSkinPickJson(key) {
    const jsonObject = loadSkins();
    const targetSkin = jsonObject[key] 
    return targetSkin;
}

//既存のスキンをJSONファイルから消す
function deleteSkinJSON(key){
    const jsonObject = loadSkins();
    delete jsonObject[key];
    saveSkins(jsonObject);
}

// 既存のスキン情報をJSONに複製する
function copySkinJSON(key, updated){
    const jsonObject = loadSkins();
    let copyedSkinData = {...jsonObject[key]};
    let newIDNum = 1;
    while (jsonObject['skin_' + newIDNum]) {
        newIDNum++;
    }
    copyedSkinData.id = 'skin_' + newIDNum;
    let newNameNum = 2;
    let isLoopContinue = true;
    while (isLoopContinue) {
        let isSameNameExist = false;
        Object.keys(jsonObject).forEach(function(key){
            if(jsonObject[key]['name'] == copyedSkinData.name + ' (' + newNameNum + ')') {
                isSameNameExist = true;
            }
        })
        if(isSameNameExist) {
            newNameNum++;
        } else {
            isLoopContinue = false;
        }
    }
    copyedSkinData.name = copyedSkinData.name + ' (' + newNameNum + ')';
    copyedSkinData.updated = updated;
    jsonObject[copyedSkinData.id] = copyedSkinData;
    saveSkins(jsonObject);
}

// 編集したスキン情報をJSONに反映する
function editSkinJSON(key, name, modelImage, skinImage, slim, updated, textureId){
    const jsonObject = loadSkins();
    jsonObject[key]['name'] = name;
    jsonObject[key]['slim'] = slim;
    if ( skinImage != null) {
        jsonObject[key]['skinImage'] = skinImage;
    }
    if ( modelImage != null) {
        jsonObject[key]['modelImage'] = modelImage;
    }
    if ( textureId != null) {
        jsonObject[key]['textureId'] = textureId;
    }
    jsonObject[key]['updated'] = updated;
    saveSkins(jsonObject);
}

// 新しいスキン情報をJSONに反映する
function addSkinJSON(created, name, skinImage, modelImage, slim, textureId){
    const jsonObject = loadSkins();
    let newIDNum = 1;
    while (jsonObject['skin_numa_' + newIDNum]) {
        newIDNum++;
    }
    const id = 'skin_numa_' + newIDNum;
    jsonObject[id] = {};
    jsonObject[id]['created'] = created;
    jsonObject[id]['id'] = id;
    jsonObject[id]['modelImage'] = modelImage;
    jsonObject[id]['name'] = name;
    jsonObject[id]['skinImage'] = skinImage;
    jsonObject[id]['slim'] = slim;
    if ( textureId != null) {
        jsonObject[id]['textureId'] = textureId;
    }
    jsonObject[id]['updated'] = created;
    saveSkins(jsonObject);
}



exports.setCamera = setCamera;
exports.getNowSkin = getNowSkin;
exports.getTextureID = getTextureID;
exports.uploadSkin = uploadSkin;
exports.addSkinPreview = addSkinPreview;
exports.editSkinPreview = editSkinPreview;
exports.generateSkinModel = generateSkinModel;
exports.exportLibrary = exportLibrary;
exports.initAddSkinPreview = initAddSkinPreview;
exports.changeSkinPickJson = changeSkinPickJson;
exports.deleteSkinJSON = deleteSkinJSON;
exports.copySkinJSON = copySkinJSON;
exports.editSkinJSON = editSkinJSON;
exports.addSkinJSON = addSkinJSON;



/**
 * Add auth account elements for each one stored in the authentication database.
 */
/*
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
 */