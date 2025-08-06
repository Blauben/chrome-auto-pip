//import { MessageCodes } from "./model/definitions";

chrome.runtime.onMessage.addListener((message, sender, sendMessage) => {
    console.log("Message received")
    handleMessage(message, sender, sendMessage)
});

function handleMessage(message, sender, sendMessage) {
    // only accept messages from service workers with a code type
     if (sender.id === null || message?.["code"] === null) {
        return
    }

    switch(message.code) {
        case 0: {
            console.log("Pip Request")
            break
        }
        default: {
            console.log(`Unknonwn Message Type: ${message.code}`)
        }
    }
}

console.log("Running AutoPip Tab Content Script")
