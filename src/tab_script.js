import { MessageCodes } from "./model/definitions.js";
import { exitPictureInPicture, getVideos, isPipPlayingInWindow } from "./pip.js"

chrome.runtime.onMessage.addListener((message, sender, sendMessage) => {
    handleMessage(message, sender, sendMessage)
});

function handleMessage(message, sender, sendMessage) {
    // only accept messages from service workers with a code type
     if (sender.id == undefined || typeof message?.["code"] !== 'number') {
        return
    }

    switch(message.code) {
        case MessageCodes.RequestPip: {
            console.log("Running AutoPip Tab Switch")
            const videos = getVideos()
            if (videos == null || isPipPlayingInWindow()) {
                return
            }
            break
        }
        case MessageCodes.ExitPipInTab: {
            if(!isPipPlayingInWindow()) {
                return
            }
            exitPictureInPicture()
        }
        default: {
            console.log(`Unknonwn Message Type: ${message.code}`)
        }
    }
}

console.log("Running AutoPip Tab Content Script")
