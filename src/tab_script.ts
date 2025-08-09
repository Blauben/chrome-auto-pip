import { MessageCodes } from "./model/definitions.js";
import { exitPictureInPicture, getVideos, isPipPlayingInWindow, requestPictureInPicture } from "./pip.js"

async function handleMessage(message, sender, sendMessage) {
    // only accept messages from service workers with a code type
    if (sender.id == undefined || typeof message?.["code"] !== 'number') {
        return
    }

    console.log(`Message received from the service worker: code ${message.code}`)
    switch (message.code) {
        case MessageCodes.RequestPip: {
            console.log("Requesting Pip")
            await RequestPipCommand()
            break
        }
        case MessageCodes.ExitPipInTab: {
            console.log("Exit PiP Request if active")
            if (isPipPlayingInWindow()) {
                exitPictureInPicture()
            }
            break
        }
        case MessageCodes.TabActivated: {
            break
        }
        default: {
            console.log(`Unknown Message Type: ${message.code}`)
        }
    }
}

async function RequestPipCommand() {
    if(isPipPlayingInWindow()) return

    const videos : HTMLVideoElement[] = getVideos()
    if (videos == null) {
        return
    }
    for (let video of videos) {
        const success = await requestPictureInPicture(video)
        if (success) {
            break
        }
    }
}

async function RegisterMediaSessionAutoPiP() {
    navigator.mediaSession.setActionHandler('enterpictureinpicture', async () => {
        RequestPipCommand()
    });
}

const main = () => {
    console.log("Running AutoPip Tab Content Script")
    RegisterMediaSessionAutoPiP()
    chrome.runtime.onMessage.addListener((message, sender, sendMessage) => {
        handleMessage(message, sender, sendMessage)
    })
}

main()