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
        width: 128,
        height: 215,
        renderPaused: true
    })
    skinViewer.width = 396;
	skinViewer.height = 528;
    setCamera(skinViewer.camera)

    // Add an animation
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation)
    walk.paused = true
    walk.progress = 5

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
}



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

// 沼ランチャーのスキンデータパスを取得する
function getLauncherSkinPath(){
    const {remote: remoteElectron} = require('electron');
    const app = remoteElectron.app;

    switch(process.platform){
        case 'win32':
            return process.cwd() + '/app/assets/js/scripts/numa_skins.json'
        case 'darwin':
            return process.cwd() + '/app/assets/js/scripts/numa_skins.json'
        case 'linux':
            return process.cwd() + '/app/assets/js/scripts/numa_skins.json'
        default:
            console.error('Cannot resolve current platform!')
            return undefined
    }
}

// 公式ランチャー内のスキンデータパスを取得する
function getLauncherSkinPathOrigin(){
    const {remote: remoteElectron} = require('electron');
    const app = remoteElectron.app;
    const appPath = app.getPath('appData');
    const homePath = app.getPath('home');
    let defaultOriginPath;
    switch(process.platform){
        case 'win32':
            defaultOriginPath = `${appPath}\\.minecraft\\launcher_skins.json`
            break;
        case 'darwin':
            defaultOriginPath = `${appPath}/minecraft/launcher_skins.json`
            break;
        case 'linux':
            defaultOriginPath = `${homePath}/.minecraft/launcher_skins.json`
            break;
        default:
            console.error('Cannot resolve current platform!')
            defaultOriginPath = ''
            break;
    }
    
    return defaultOriginPath;
}

function existsDefalutSkinPath() {
    const defaultOriginPath = getLauncherSkinPathOrigin();
    return fs.existsSync(defaultOriginPath);
}


// 沼ランチャー内のスキンのJSONを呼び出し・オブジェクトに変更
function loadSkins(){
    const skinJSON = path.join(getLauncherSkinPath())
    const jsonObject = JSON.parse(fs.readFileSync(skinJSON, 'utf8'));
    return jsonObject;
}

// 公式ランチャーのスキンのJSONを呼び出し・オブジェクトに変更
function loadOriginSkins(){
    const originskinJSON = path.join(getLauncherSkinPathOrigin())
    const originjsonObject = JSON.parse(fs.readFileSync(originskinJSON, 'utf8'));
    return originjsonObject;
}

// JSONへの書き込み
async function saveSkins(jsonObject){
    const skinJSON = path.join(getLauncherSkinPath())
    let json = JSON.stringify(jsonObject, null, 2)
    json = json.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    })
    fs.writeFileSync(skinJSON,json);
}

// JSONへの書き込み
async function saveOriginSkins(jsonObject){
    const skinJSON = path.join(getLauncherSkinPathOrigin());
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



/*----------------------
JSON同期・非同期
----------------------*/

// 同期・初期設定の保存JSON呼び出し
function loadSettingSkin(){
    const skinSettingPath = process.cwd() + '/app/assets/js/scripts/skinSetting.json';
    const settingJSONObject = JSON.parse(fs.readFileSync(skinSettingPath, 'utf8'));
    return settingJSONObject;
}

// 同期・初期設定の保存JSON保存
function saveSettingSkin(settingJSONObject){
    const skinSettingPath = process.cwd() + '/app/assets/js/scripts/skinSetting.json';
    let json = JSON.stringify(settingJSONObject, null, 2)
    json  = json.replace(/[\u007F-\uFFFF]/g, function(chr) {
        return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
    })
    fs.writeFileSync(skinSettingPath,json);
}

// 初回時、公式スキンを沼ランチャーにインポートする
function importOriginalSkinJSON(){
    const src = path.join(getLauncherSkinPathOrigin());
    const dest = process.cwd() + '/app/assets/js/scripts/numa_skins.json';
    try{
        fs.copyFileSync(src, dest)
        console.log('ファイルをコピーしました。');
        saveImportSkins();
        $('.accept__slideIn').addClass('is-view');
    } catch(error) {
        console.log(error);
        $('.decnine__slideIn').addClass('is-view');
    }
}

// 初回時、自分で設定したパスでを沼ランチャーにインポートする
async function importMySettingOriginalSkinJSON(){
    const settingJSONObject = loadSettingSkin();
    const src = settingJSONObject['settings']['myOriginSkinPath']
    const dest = process.cwd() + '/app/assets/js/scripts/numa_skins.json';
    try{
        fs.copyFileSync(src, dest)
        console.log('ファイルをコピーしました。');
        saveImportSkins();
        $('.accept__slideIn').addClass('is-view');

    } catch(error) {
        console.log(error);
        $('.decnine__slideIn').addClass('is-view');

    }
}

// インポートしたかの記録をJSONに反映する
function saveImportSkins() {
    const settingJSONObject = loadSettingSkin();
    settingJSONObject['settings']['import'] = true;
    saveSettingSkin(settingJSONObject);
}

// 同期するかどうかの情報を保存する
function saveSkinSetting(sync){
    const settingJSONObject = loadSettingSkin();
    settingJSONObject['settings']['sync'] = sync;
    saveSettingSkin(settingJSONObject);
}

// 公式ランチャーのパスを任意で保存する
function saveMyOriginSkinPath(path){
    const settingJSONObject = loadSettingSkin();
    settingJSONObject['settings']['myOriginSkinPath'] = path;
    saveSettingSkin(settingJSONObject);
}

// 公式ランチャーからJSONがインポートされたかどうかチェック
function checkImportedSkinJSON(){
    const settingJSONObject = loadSettingSkin();
    const importSetting = settingJSONObject['settings']['import'];
    return importSetting;
}

// JSON同期しているかどうかの情報をチェックする
function checkSyncSkinJSON(){
    const settingJSONObject = loadSettingSkin();
    const syncSetting = settingJSONObject['settings']['sync'];
    console.log(syncSetting);
    return syncSetting;
}

// 沼ランチャーに公式スキンのJSONをmergeする（同期trueの時のみ動かす）
async function mergeOriginalSkinJSON(){
    const syncSetting = checkSyncSkinJSON();
    if(syncSetting){
        const numajsonObject = loadSkins();
        const originjsonObject = loadOriginSkins();
        const returnedTarget = Object.assign(numajsonObject, originjsonObject);
        await saveSkins(returnedTarget);
    }
}

//　公式ランチャーへ沼ランチャー更新を反映する（同期trueの時のみ動かす）
async function mergeNumaSkinJSON(){
    const syncSetting = checkSyncSkinJSON();
    if(syncSetting){
        const originjsonObject = loadOriginSkins();
        const numajsonObject = loadSkins();
        const returnedTarget = Object.assign(originjsonObject, numajsonObject);
        await saveOriginSkins(returnedTarget);
    }
}

// function addValue(){
//     var idname = "resultMyOriginSkinPath";
//     s = document.getElementById(idname).value;
//     var pvname = idname + "pv";
//     document.getElementById(pvname).innerHTML = s;
// }

// function addedValue() {
//     const inputSkinPath = $('input:text[name="importOriginSkinPath"]').val();
//     if (!(inputSkinPath.value == "")) {
//         $('.addedSkinPath').fadeIn();
//         console.log('入力はいったよ！');
//     }
// }


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
exports.importOriginalSkinJSON = importOriginalSkinJSON;
exports.mergeOriginalSkinJSON = mergeOriginalSkinJSON;
exports.saveSkinSetting = saveSkinSetting;
exports.saveImportSkins = saveImportSkins;
exports.mergeNumaSkinJSON = mergeNumaSkinJSON;
exports.existsDefalutSkinPath = existsDefalutSkinPath;
exports.saveMyOriginSkinPath = saveMyOriginSkinPath;
exports.importMySettingOriginalSkinJSON = importMySettingOriginalSkinJSON;
exports.checkSyncSkinJSON = checkSyncSkinJSON;
exports.checkImportedSkinJSON = checkImportedSkinJSON;
// exports.addedValue = addedValue;


// exports.addValue = addValue;

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