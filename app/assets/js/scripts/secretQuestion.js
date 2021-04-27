const selectedUUID = ConfigManager.getSelectedAccount().uuid

const axiosBase = require('axios')
const { resolveFiles } = require('electron-updater/out/providers/Provider')
const axios = axiosBase.create({
    headers: {
        'Content-Type': 'application/json',
    },
    responseType: 'json',
})

$('#newsButton').on('click', async () => {})

async function isCurrentIPSecured() {
    const config = {
        headers: {
            Authorization:
                'Bearer ' +
                ConfigManager.getAuthAccount(selectedUUID).accessToken,
        },
    }

    return await axios
        .get('https://api.mojang.com/user/security/location', config)
        .then((res) => {
            return res.status == 204
        })
}

async function getSecurityQuestions() {
    const config = {
        headers: {
            Authorization:
                'Bearer ' +
                ConfigManager.getAuthAccount(selectedUUID).accessToken,
        },
    }
    return await axios
        .get('https://api.mojang.com/user/security/challenges', config)
        .then((res) => {
            return res.data
        })
}

async function sendSecurityAnswers(answers) {
    return await axios({
        method: 'post',
        url: 'https://api.mojang.com/user/security/location',
        headers: {
            Authorization:
                'Bearer ' +
                ConfigManager.getAuthAccount(selectedUUID).accessToken,
        },
        data: [
            {
                id: answers[0].id,
                answer: answers[0].answer,
            },
            {
                id: answers[1].id,
                answer: answers[1].answer,
            },
            {
                id: answers[2].id,
                answer: answers[2].answer,
            },
        ],
    })
}
