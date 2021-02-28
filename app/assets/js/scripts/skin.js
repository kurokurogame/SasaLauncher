
const skinFunc = require('./assets/js/scripts/skinfunc');




/*----------------------　DOM操作関連　----------------------*/


/*----------------------
ロード時の読み混み
----------------------*/

$(window).on('load', function(){
    skinFunc.getNowSkin();
    skinFunc.exportLibrary ();
});



/*----------------------
スキンを新しく追加する
----------------------*/

//　スキン新規追加画面を開く
$('.selectSkin__addNew').on('click', function(){
    $('#addNewSkinContent').fadeIn();
    skinFunc.initAddSkinPreview();
    return false;
}); 

//　新規追加して保存する(着替える)
$('.addSaveAndUse').on('click', async function(){
    const name = $('input:text[name="skinAddName"]').val();
    const variant = $('input:radio[name="skinAddModel"]:checked').val();
    let slim = '';
    if(variant == 'slim'){
        slim = true;
    } else{
        slim = false;
    }
    const now = new Date();
    const created = now.toISOString();
    const file = $('#skinAddBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", async function () {
        const skinImage = reader.result;
        const modelImage = await skinFunc.generateSkinModel(skinImage);
        await skinFunc.uploadSkin(variant, file);
        const textureID = await skinFunc.getTextureID();
        skinFunc.addSkinJSON(created, name, skinImage, modelImage, slim, textureID);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#addNewSkinContent').fadeOut();
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    } else {
        if (slim == 'true'){
            skinImage = skinOriginImg.alexSkinImage;
            modelImage = skinOriginImg.alexModelImage;
        } else {
            skinImage = skinOriginImg.steveSkinImage;
            modelImage = skinOriginImg.steveModelImage;
        }
        await skinFunc.uploadSkin(variant, file);
        const textureID = await skinFunc.getTextureID();
        skinFunc.addSkinJSON(created, name, skinImage, modelImage, slim, textureID);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#addNewSkinContent').fadeOut();
    } 
}); 

//　新規追加して保存する(着替えない)
$('.addSave').on('click', async function(){
    const name = $('input:text[name="skinAddName"]').val();
    const variant = $('input:radio[name="skinAddModel"]:checked').val();
    let slim = '';
    if(variant == 'slim'){
        slim = true;
    } else{
        slim = false;
    }
    const now = new Date();
    const created = now.toISOString();
    const file = $('#skinAddBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", async function () {
        const skinImage = reader.result;
        const modelImage = await skinFunc.generateSkinModel(skinImage);
        skinFunc.addSkinJSON(created, name, skinImage, modelImage, slim, null);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#addNewSkinContent').fadeOut();
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    } else {
        if (slim == 'true'){
            skinImage = skinOriginImg.alexSkinImage;
            modelImage = skinOriginImg.alexModelImage;
        } else {
            skinImage = skinOriginImg.steveSkinImage;
            modelImage = skinOriginImg.steveModelImage;
        }
        skinFunc.addSkinJSON(created, name, skinImage, modelImage, slim, null);
        
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#addNewSkinContent').fadeOut();
    } 
}); 

//　スキン新規追加画面を閉じる
$('.closeAddNewSkin, input.closeAddNewSkin').on('click', function(){
    $('#addNewSkinContent').fadeOut();
    return false;
}); 

//　新規追加画面の3dViewerリアルタイム反映
$('#skinAddBox, #skinAddModelClassic, #skinAddModelSlim').on('change', function(){
    const variant = $('input:radio[name="skinAddModel"]:checked').val();
    const file = $('#skinAddBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        const skinURL = reader.result;
        skinFunc.addSkinPreview(variant, skinURL);
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    } else {
        if(variant == 'classic'){
            skinFunc.addSkinPreview(variant, skinOriginImg.steveSkinImage);
        } else {
            skinFunc.addSkinPreview(variant, skinOriginImg.alexSkinImage);
        }
    }
});



/*----------------------
既存のスキンを編集する
----------------------*/

// スキン一覧の操作パネルを開く
$('.selectSkin__Wrap').on('click','.skinEditPanel', function(){
    $(this).next('.selectSkin__btn__inner').toggleClass('is-view');
    
    return false;
}); 

// ライブラリにあるスキンの編集画面を開く
let editSkinSelectedImage = ''
$('.selectSkin__Wrap').on('click', '.editSkinBox' , function(){
    $('#editSkinContent').fadeIn();
    $('#skinEditBox').val(null);
    const dataID = $(this).data('id');
    const targetSkin = skinFunc.changeSkinPickJson(dataID);
    $('#editSkinContent .editSave,#editSkinContent .editSaveAndUse').attr('data-id', dataID);
    const name = targetSkin.name;
    const skinImage = targetSkin.skinImage;
    const slim = targetSkin.slim;

    $('input[name="skinEditName"]').val(name);
    let variant = ''
    if (slim == 'true') {
        $('input[name="skinEditModel"][value="classic"]').prop('checked', false);
        $('input[name="skinEditModel"][value="slim"]').prop('checked', true);
        variant = 'slim'
    } else {
        $('input[name="skinEditModel"][value="classic"]').prop('checked', true);
        $('input[name="skinEditModel"][value="slim"]').prop('checked', false);
        variant = 'classic'
    }
    skinFunc.editSkinPreview(variant,skinImage);
    editSkinSelectedImage = skinImage
    return false;
}); 

// 変更・編集して保存（着替える）
$('input.editSaveAndUse').on('click' , async function(){
    const key = $(this).data('id');
    const name = $('input:text[name="skinEditName"]').val();
    const variant = $('input:radio[name="skinEditModel"]:checked').val();
    const targetSkin = skinFunc.changeSkinPickJson(key);
    const nowSkin = targetSkin.skinImage;
    
    let slim = '';
    if(variant == 'slim'){
        slim = true;
    } else{
        slim = false;
    }
    const now = new Date();
    const updated = now.toISOString();
    const file = $('#skinEditBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", async function () {
        const skinImage = reader.result;
        const modelImage = await skinFunc.generateSkinModel(skinImage);
        await skinFunc.uploadSkin(variant, file);
        const textureID = await skinFunc.getTextureID();
        skinFunc.editSkinJSON(key, name, modelImage, skinImage, slim, updated, textureID);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#editSkinContent').fadeOut(); 
    }, false);
    if (file) {
        reader.readAsDataURL(file);
        
    } else {
        const res = await fetch(nowSkin);
        const blob = res.blob();
        const file = new File([blob], name,{ type: "image/png" })
        await skinFunc.uploadSkin(variant, file);
        const textureID = await skinFunc.getTextureID();
        skinFunc.editSkinJSON(key, name, null, null, slim, updated, textureID);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#editSkinContent').fadeOut();
 
    } 
});

//　変更・編集して保存　(着替えない)
$('input.editSave').on('click' , async function(){
    
    const key = $(this).data('id');
    const name = $('input:text[name="skinEditName"]').val();
    const variant = $('input:radio[name="skinEditModel"]:checked').val();
    let slim = '';
    if(variant == 'slim'){
        slim = true;
    } else{
        slim = false;
    }
    const now = new Date();
    const updated = now.toISOString();
    const file = $('#skinEditBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", async function () {
        const skinImage = reader.result;
        const modelImage = await skinFunc.generateSkinModel(skinImage);
        skinFunc.editSkinJSON(key, name, modelImage, skinImage, slim, updated, null);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#editSkinContent').fadeOut();
    }, false);
    if (file) {
        reader.readAsDataURL(file);
        
    } else {
        skinFunc.editSkinJSON(key, name, null, null, slim, updated, null);
        $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
        await skinFunc.exportLibrary ();
        $('#editSkinContent').fadeOut();
    }    
}); 

//　スキン編集画面を閉じる
$('.closeEdit, input.closeEdit').on('click', function(){
    $('#editSkinContent').fadeOut();
    return false;
}); 

//　編集画面の3dViewerリアルタイム反映
$('#skinEditBox, #skinEditModelClassic, #skinEditModelSlim').on('change', function(){
    const variant = $('input:radio[name="skinEditModel"]:checked').val();
    const file = $('#skinEditBox').prop('files')[0];
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        const skinURL = reader.result;
        skinFunc.editSkinPreview(variant, skinURL);
    }, false);
    if (file) {
        reader.readAsDataURL(file);
    } else {
        if(variant == 'classic' ){
            skinFunc.editSkinPreview(variant, editSkinSelectedImage);
        } else {
            skinFunc.editSkinPreview(variant, editSkinSelectedImage);
        }
    }
});



/*----------------------
既存のスキンを使用する
----------------------*/

// ライブラリにあるスキンに着替える
$('.selectSkin__Wrap').on('click', '.useSelectSkin' , function(){
    const targetSkin = skinFunc.changeSkinPickJson($(this).data('id'));
    const name = targetSkin.name;
    const skinImage = targetSkin.skinImage;
    const slim = targetSkin.slim;
    const skinURL = skinImage;
    let variant = '';

    if(slim == 'true'){
        variant = 'slim'
    } else{
        variant = 'classic'
    }

    fetch(skinURL)
    .then(res => res.blob())
    .then(blob => {
        const file = new File([blob], name,{ type: "image/png" })
        skinFunc.uploadSkin(variant, file);
    })

    
    return false;
}); 



/*----------------------
既存のスキンを削除する
----------------------*/

 // スキンをライブラリから削除する
$('.selectSkin__Wrap').on('click', '.deleteSkinBox', function(){
    skinFunc.deleteSkinJSON($(this).data('id'));
    $(this).parents('.selectSkin__item').remove(); 
    return false;
}); 



/*----------------------
既存のスキンを複製する
----------------------*/

//　スキンをライブラリに複製する
$('.selectSkin__Wrap').on('click', '.copySkinBox', async function(){
    const key = $(this).data('id');
    const now = new Date();
    const updated = now.toISOString();
    skinFunc.copySkinJSON(key, updated);
    $('.selectSkin__Wrap').children('.skinLibraryItem').remove();
    await skinFunc.exportLibrary ();

});



/*----------------------
jsonの呼び出し・同期設定をする
----------------------*/

//　スキン用セッティング画面を開く
$('.openSettingSkinEditor').on('click', function(){
    $('#editLauncherSkin').fadeIn();
    return false;
});

//　セッティング画面を閉じる
$('.closeSettingSkinEditor').on('click', function(){
    $('#editLauncherSkin').fadeOut();
    return false;
}); 


