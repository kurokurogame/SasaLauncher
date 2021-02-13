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
        // const skinViewer = initSkinViewer()
        // skinViewer.loadSkin(skinURL)
        //     .then(() => skinViewer.render())
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
        // axios.put('https://api.minecraftservices.com/minecraft/profile/skins',param,config)
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
function initEditSkinPreview(){
    let skinViewer = new skinview3d.SkinViewer({
		canvas: document.getElementById("skin_container--Edit"),
		width: 300,
        height: 400,
        skin: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAASiElEQVR42u1aZ3CUZ5KWcziXUzljmwwKSCCJZHZ9rtu7cu2tbUA5R0Tw/rjaX1dXdWYJyjmDQDmBESBEWBuQBEoIk7zeO3xn9qpAOc1oRpNHCOm57h6NDLYSB3vCVZqqV/Ol+fT200+H9+22AWAz0Th9+rTKaVUebn5yGQ6uh+GwshKuv6rAmt9cx18/aYbzB2VyPNmY7P3TGZO942G8f1oT+O6jGixdfhhLlluEX7q8GDfdr8B2ReHfHIC/9bCZigH/9VE9fvjHJqz68ASWrjgGx5WlWLGmCNc+Posf/rkJw8PDMJlM6G9thVapxJ07dzA0NAS1SsXC4/vvvx+hofrFAnC3Nm2dq+R7yfLjWPPRcQKiHEMGA65fvw6TQoHbt29Do9FAQcfy0etx48YN1180AxxXnyCqH8BixxLSfh6cVh+m8wIBwmlVIawfLWlcNap1ooAIr2xv/+WawJkzZ1SkyWEH1xNYvuagCOz8QaV8u6w7gkXLyuVYp9PBaDSOAcEssJ7zPTKP/xf6v/baa3jqqafw6quv4pVXXsFDYQBPnoVc7FQJ57V5WPnrE8SAE3BcVTpmFqNCyqATaLVajIyMAGQafE+v14/weyYaU03Qdd1h2LtUkP+ppP9fRb6oiiLSATK/UmJkwZigb7zxBl5++WU888wzePLJJ/FQo8BkY2RU42z7ys5O9PX1iSPs7e0FIQFm0lQgPwwGPPbYY3j88cdF+GcJhGkDYKH2Efz3x41YtvLQlGFtomG7ogpOa06JmVz/bT2ZTQWWry6F67oy/ODRLM8sW3Vi7PmbblcmDZWLHPKmLYSdc8m4zy6wy500FNs5F8Hm+m/q8MM/NOLWJ5YJOa0uxuq/PwaXD0qtP5bPE088Me7xeGD8x/o6fP9ZA/7z4zoBg4clf8jF8rUWEK67N+K7357DArv8cSfosu7YtAHgqDTRdddfnZoYAJcTsGE7miyjU1JsN5FdM7X/QhbDg2M/f1Td3fc8a+dyHIzq8tUF91y3dzlEdnuUJnOMAD5ATKkim/6ThRWu4wOwYk3+tAHg9413faFDATnsikkzSfmz8sOTNMEjNPlDNApoclVjk2dbtjo6cRk0NASK9br1OZ7Eqg+Pj50vW/lzUBc7lY8BsvLXJy3XHIvwoGnuEqdSTOa/JgVg2apTk6ey+zMlvo9QXLcCwKFOAKF7/MwixwOi4SVOR0nwKjKhSji45GLFKN3ZRu1dj2ORQz6ZwPFppcv3A8Bk75jsPY6rKmFj62xJbGydT5FmjtEEK0mggz9OjoTVq9ViCmwGGjpmMBgETnfH6O+cD34h5wgu674Uh+f8wSHyJUUEROXYcw4uhXBcfZLCWCGZQ9WEE3Ree+iBAXBa/eWkALDp29iuyJM4a+96clwGsKaNJOjTTz8tCYb1m1lhovDHz8wnR2Z93nltIdn6YfID+WQSJ4kRJWP3Vqw9SqD8GAkWEiMW2I9v68tXF04bABcSZCJgOF+Y0HeQPxqjyQL7QgKinDRZTsveH82CHZ62p2dMcB7PP/ccTGT/IxTv7wZrgX0BCVUIBtVlXemoL+DFU544RjtnYoZroTBl6Qo6XkkOc03ZBE6w+J7rdyc3L734Iu4VpHzcdyx2LJa5TOoDfnpR01AK/fl86C4chPKrTDg4OGDOnDlYumQJ3n//ffwkidkxmjareajqy24NXaPwdfkgRi4UwdRIQlw7gttXjmC4IQ+6M5noqC5Gd22J3OPRcSIDhvpC6M4XyDFdO8fv5KTG1Fh0noHnYx425H9S+kKRqPVFvMETO1vcoK7JxbWCXeik3yrP7JNnnqaU+P+cCepqcoArZH/fkGYuFIjg7777Lt555x0soeOfZXI0SR7PP//8TmNjsZqFUlfvHxPw7mFoKIK+rnDcezwYBHoPzI3FqtFcw+bZZ58VoRgYuq7+4tanSOkJR5TCDakDoRiozYWeANRW50B7OkOAeqDFkLGBbO/SAejPZokg8+bNw9y5c0X74wNQfE4EaCi6NZ5Q2nP595yPahn9Z/fJuPta+/F0WObAQFqAZQbYyDTpemOROk0XihRlKJLNfojvCYAVcCOBqyHl3U8aPC4Aw5cPwdxQINrS1ewTBjAAYgZLl+Kn2jc3lgxZhWOtTaTd6QwGgrR8mwW1/o/PPf7pplWrJKR6V5sbIrvdkdATiEzNZihPpVlAqC8DMVDAsgI2LQBSB0KQ0huGBI0vott9EKV0Q7TCA6nmAES3+CGuNQixSm8k9gXKczvaNyBSuQFp+hCk68JkMqn9YUgxBiKq1QexKi/RUEyPNyI7PLDX8DliunwQ2bcRse3+SO3dhBiFJ9L1ZMvKQOwz/x4x3T7I0mzBXuM2xPR5IVrpjkSjD7IHIxCp2oBM4yYk6fzougfSTEHY2bWent+K+K4AJCmDkGP8XN7B/yehLQTxvf5I0vojqsdjSiBskrvCENXnjiQVCdDhhQSDF6LavOmfhiOu2w+phkBE9rgjriMAu9s8CCgfASBa5S4C7jFvwR7jViR0BCO6zQfxrcFI0QYhuTcUUS10riZBjJuRaYhAnNYDMW3+SDfQJAe8EUvHcUpfpKhDkEzOLb0/QiYdR/ciW72RrApGpnYz4rXeJHgw0hSbREGstCzdFnqXHzLUEdje9iliWv2RZYpAas8mpGvDEU/vTdL7TQ1AgtYHKbpAESJFF4SoXnf5h0k61lY4vSwMu3rWI7bHF9tbPsPuPmKAYiP9483I1m5FptoyQdZWTK+3CJDYHoLYfi8SxEsESFD5IbLXDXEKXwFqN7EhQeeDHS0bxZNvb/8UcX2+wqCYPk8k6i2gpPdtRkynD3l9P6F8VKeXzDNW547dXW5IaAlFZBeBqvJAsiIEO3s+I2A2Y1fnRmSbNhN7A6cGANeOQt9QDP3FCgx8nYElixZBUZ2LoaZiCYHGunyYL5TCVJ8PDpEKsjlFbSGG/3wcw1cPI4covMe0FTED7ojRuiFG7SFaYY1idNGU1B2KhG4yJWJUfEcQMkzEOoU7sgbDkdy5CQmtIUjqoudHN1UYwOSOcES2eSGmhVii9UKSOgBxBhK8nexf7YtEkzf2GLaRErYJM6IJKI4MUd2kgN4gxLST+Wo8pwbAcdkyLF64EItozCNnZ2dnhzdef108/mICg0HgYW9rK9+v0z12iAsWLICjoyNSVCFkEhuRrA5C9ADRUxWGL1p+J4LzzhBvjvAnwxyK2D4fbG8lbXcGIFUZjpSBIMTrPZGhiZB9RAOl28MEwh1afabpQgi0QPHulhD5YzRhZ6dvLMXg1Uo5N1+phJZyDGVNHgyXDgMXS+R3nI9MCQALtYxAmENxfv78+TJhx1FB+fPWm29iPoVC3nJ666238Cad8zEPO4oKrAX2H4kG0orRG3v1n0On0QCDgzAYDLwlJpplMDK0m8juA5CmjBD7zzSH448tGywbC5xy37W3yMfs0FhAfV0BhdO8cSOH6myORIDBSxUwNZVi6GI57jSXwHDxS4w0TZ1O27CgPN577z3R/jtvvy2AvEkCsob5mK/bEgP4Gb7PQDEQDMiuFooCinChcYzaHTtb3WSZzAkMx3DerORjQhZp/eHY1bdeaJyl34LEtlCx1yFaV3CosyY9PAy08Moa2CpZ4s8SJor3xrvOJfOs30+aL4WO8hdjdTYGyWR1Z7OnAQBNcCHRnyf6NgnHQjnY20vMX0QmwKbA3yy8ZIWjTGHmzCeTie/xl1CY2B6KbPNmZAxEwGw2ixCcF/AurQBAn6hOT0plw5CqD5KwlaGNEBvm9cZzo8K/8MILljhO11L1wfifgzFC5/GAuHuw30JjrhzfaSTh64kddcVTA8BCszatg/0BC8gU5xSYAWGAbEl41r4VHGbI23QvlpwNC5Wp3iKxWZwZfV566SW8SIsW3qVlobhalKkn52jyEzNIN1BGpwhDUk8w8x1/Rykwb2yy8LzwuU2mk2oKGBOQzUC+q/dA11QuDGBgdGeyLNdJ23rS/FBjARR/SpdsdvDiNHwAa5UF55SXBeScn0FhITkD5G9mAZsAO0z2B+wAmQEMUCoJEa+hmN1rCUOJZgqhnWFivwl9AZawavagJMuXkqj1wpYdbeslV2BvzSaTpqWkSOeLuF4/7O6mENlPnl9NCZXRHzcPxY2m1BYf0H96j9Bb9XUmTM2UsjeUkAl8KQIzS8xXjpI57IO2ie8VTQ0AC87en2k+l2jO2mah+Zttn0GQSLF4sbCBI4At3WeQ+Bp766SeEBGOtcqJEOfoHBIzTKGSPyR0crb2e+xu9bCESbrOzpLBSmglP9BOMV3vjRQyDc7104yUVGk2Isuw+d51RS0tbf9cBQMdD56nRdu3ldA1WFaWg1ePyfcIAXH74gF5znjpyGQA/IHE/4MNa5Pp/h5pk7XMwrG98zUW1p4pT4KyQ2QgrOecL/BvMnURyNCFi2PjdJlT5B2d65GqDpGkhDNFTpCSdRT6+kMlrieavZDYGSzCR6sod+j0lXC4s5sY1GUBNEO1Bdm6rcIA1qymxrLCRFM+BpvLxOY1jeUYIGYMXzpIJlGKWxXElnP7aHGUA83pTKB5Eh/AwvN41Gt3P90PmJLSD7of8KgNa2ic7vMPvB/wKDLgfgB46B0iM16+trHZeb9ava/389LyUQdhxhokZgGYBWAWgFkAZgGYBWAWgFkAZgGYBWAWgOmPqxXAN+VQnitCf02ebLfxZop1232q3+/sXI8kgy+iu7yw49YG8PvUX2fIO83T2OObcQDu1O+Hsb4QI1ePQN1YLmV13j90IhB4l2mq32cZIhDT6Y24Fi7XbYHuYgW46cJ8fh/MtXsefQCGLldgmEDQ1BXBfKFMtM97h6x93nec6vdJykAkKPyRqd0kW23SrHHpAMzct9CY++gDYD6Xg+FGS4sN7+C+O2eOFF5475HNYarfpxkD8UXr75A8EIB4rZdlX6+5SGqUw83Fjx4AkZ2eiFJtQLLeX1pWdrW6S7k9VuEjFeRMbQSSO8OR3kqU1m8V++YqEm+mfnXj33Dyr/+OveZtUnnmHgXeOY5u9UFUqxeSNP5STcroJ7PQuIHZEaP0QLomTHoCUnpDMeMAcFk6utdDCiIJfYFINQZJL0FifwBiyY4jO92lIWJHywbE9fsgXu8l2+DcbFF8819Q0fWviNN6IrbLT6pFiaoApBmCka4NRSo9w8WRFH0A4gY8kajzka33BJMnUlUh2N76ycwDkKgIRLzOG7t7N9DEQ6TBgjs0uFqUqPFDiipUOj+iO7yR1BuMOJW3NDkldRAAN7Yi52a4dIOw9082+COxJxB/bP0Uuzo2YK9hG9L6NkmzRrzOU8ruCWYPxPZ5I00TgtgOv5kHQNt8SEIVmkugrN4vtQRuXTNcOCD1BVwoouu5UNQWAN9VWb6vHbH09tTlorx/G1E7GNHt3qLRWL0bMcVbWBKv9BGqcyNGjModqd2bkKwJIO2HIqkvCJFdbjMPAJfSnZycxNFxuOOqEoc7LqHxbi5Xl/mcHeDc0QrUQnKIfMyluAGKFoNNJVL6Yodn+IbC3sUD0BOA+qZyGMj5oTFPooGxdi/QVADz5SNAA4Fcu2/mAeDyGQvJJTbpKRgelsIpV5D4w6Bwo8VCCoP8DAPE5+8TO7gkN3A6C6qv0qW+11edB219MbQEivZ8ARRnKaeo2YPbF0qgaSiTzhRtLQl+np6rK4TuTMbMA8DldQcCgbXKsX4ZCWwtqUvdkQbXFBkQNg/WvDUk8vMDZ7Itpe0LhTK4q1RXV2ApgjaXUQZYKvU/A2mfy17c/cFDW2vpDXwkAGDNc8KzhBIea1+APTdbUPrLgEijBQHAgnM1muuKbDY8hhryLJQmv6AlynPyhIb9MNfni8BDTZRSf51poXx1NgbomJ+Xa5cPzjwArF0WkDXOGmXHZ+3y4Aoys4H9BPuBeZQWc1bIg+/x4ArvwLkCyvczoSc/cPvqUejJsZoYiL+cxMDZvRi6fEjK4YazWQKM9mw2RggQ7madcQCY2gwAU5tt2tpcsYC+GQS+zlVkFpbXBU7kL7gMz+xgsxmmRY62JgeKMzlQ15WQgAUSUUbIJww1l0JdS0wgx4jvTgjthS2XyoUlqnMFMw8Ae3L70a4RFpCdIq/8uJQuAJCwfF0iA4HCz3LjlbURA98ew51vq8QEOOXlTi82A319EQzNB6GqzSNw9krz02BDgawKeZ1hIOeoInbMOADcJcLCcUMFH7PQ3OrCIPAxrwXYPNhPsM1bGyu4D4GZw40MWnJyw03k4RtKZQmtq96Dobp94u2VNflkGrnQnM6QUDhUnyfdYPqmMmmNe9D5/y/biQsEp4j/JAAAAABJRU5ErkJggg=="
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

const steveSkinImage = 'data:image/png;base64,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'
const alexSkinImage = 'data:image/png;base64,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'

function initAddSkinPreview(){
    updateAddSkinPreview('classic',steveSkinImage);
}

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

// function initSkinList() {

// }
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
        `<div class="selectSkin__item" id="number${id}">
            <p class="selectSkin__item__ttl">${name}</p>
            <div class="selectSkin__item__skinimg"><img src="${modelImage}">
            <div class="selectSkin__item__hover" style="display: none;">
                <div class="selectSkin__btn--use useSelectSkin" data-skinimage="${skinImage}">使用する</div>
                <div class="selectSkin__btn--other__wrap">
                    <div class="selectSkin__btn--other skinEditPanel">…</div>
                    <div class="selectSkin__btn__inner">
                        <div class="selectSkin__btn__inner--delete deleteSkinBox">削除</div>
                        <div class="selectSkin__btn__inner--copy copySkinBox">複製</div>
                        <div class="selectSkin__btn__inner--edit">編集</div>
                    </div>
                </div>
            </div>
        </div>`

        $(".selectSkin__Wrap").append(skinItem);

    }, data);
});

function changeSkinPickJson() {
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
    
        }, data);
    });
}

$('.closeAddNewSkin, input.closeAddNewSkin').on('click', function(){
    $('#addNewSkinContent').fadeOut();
    return false;
}); 

$('.selectSkin__addNew').on('click', function(){
    $('#addNewSkinContent').fadeIn();
    return false;
}); 

$('.closeEdit, input.closeEdit').on('click', function(){
    $('#editSkinContent').fadeOut();
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

$('.selectSkin__Wrap').on('click', '.selectSkin__btn__inner--edit' , function(){
    $('#editSkinContent').fadeIn();
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

$('.editLauncherSkin__btn').on('click', function(){
    $('#editLauncherSkin').fadeIn();
    return false;
});

$('.closeEditLauncher').on('click', function(){
    $('#editLauncherSkin').fadeOut();
    return false;
}); 