// Function to immediately request PiP when icon is clicked
function immediatelyRequestPiP() {
    console.log("=== IMMEDIATE PIP REQUEST ===");

    // First check if any video is already in PiP mode
    const pipVideo = document.querySelector('[__pip__]');
    if (pipVideo || document.pictureInPictureElement) {
        console.log("🔄 Video already in PiP - toggling off");
        try {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            }
            if (pipVideo) {
                pipVideo.removeAttribute('__pip__');
            }
            console.log("✅ PiP deactivated successfully!");
            return "toggled_off";
        } catch (error) {
            console.error("❌ PiP exit failed:", error);
            return false;
        }
    }

    // Find any video that can support PiP (both playing and paused for manual activation)
    const videos = Array.from(document.querySelectorAll('video'))
        .filter(video => video.readyState >= 2)
        .filter(video => video.disablePictureInPicture == false)
        .filter(video => {
            // For manual activation, include both playing and paused videos
            const isPlaying = video.currentTime > 0 && !video.paused && !video.ended;
            const isPaused = video.currentTime > 0 && video.paused && !video.ended;
            const hasContent = video.readyState >= 2 && video.duration > 0 && !video.ended;

            const pass = isPlaying || isPaused || hasContent;
            console.log(`Manual PiP video check:`, {
                isPlaying,
                isPaused,
                hasContent,
                pass,
                currentTime: video.currentTime,
                paused: video.paused,
                ended: video.ended
            });
            return pass;
        })
        .sort((v1, v2) => {
            const v1Rect = v1.getClientRects()[0] || { width: 0, height: 0 };
            const v2Rect = v2.getClientRects()[0] || { width: 0, height: 0 };
            return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
        });

    if (videos.length === 0) {
        console.log("❌ No suitable videos found for manual PiP");
        return false;
    }

    const video = videos[0];
    console.log("🎥 Found video for manual PiP:", {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration
    });

    // Request PiP immediately (works with both playing and paused videos)
    video.requestPictureInPicture().then(() => {
        video.setAttribute('__pip__', true);
        video.addEventListener('leavepictureinpicture', event => {
            video.removeAttribute('__pip__');
            console.log("📺 Left immediate PiP mode");
        }, { once: true });
        console.log("✅ Immediate PiP activated successfully! (video was", video.paused ? "paused" : "playing", ")");
        return true;
    }).catch(error => {
        console.error("❌ Immediate PiP request failed:", error);
        return false;
    });
}

// Execute the function
immediatelyRequestPiP(); 