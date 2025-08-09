// courtesy of apotenza92 [GitHub, accessed 09.08.2025](https://github.com/apotenza92/chrome-auto-pip)

// --- [ FUNCTION: Get Video ] --- //
export function getVideos(): HTMLVideoElement[] {
  console.log("=== PIP getVideos() START ===");

  const allVideos = Array.from(document.querySelectorAll('video'));
  console.log(`Found ${allVideos.length} video elements in frame on page`);

  allVideos.forEach((video, index) => {
    console.log(`Video ${index}:`, {
      readyState: video.readyState,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended,
      duration: video.duration,
      disablePictureInPicture: video.disablePictureInPicture,
      src: video.src || video.currentSrc || 'no src'
    });
  });

  const videos: HTMLVideoElement[] = allVideos
    .filter(video => {
      const pass = video.readyState >= 2;
      console.log(`Video readyState filter (>=2): ${pass} (readyState: ${video.readyState})`);
      return pass;
    })
    .filter(video => {
      const isPlaying = video.currentTime > 0 && !video.paused && !video.ended;
      const isReadyToPlay = video.readyState >= 3 && !video.ended && video.duration > 0;
      const pass = isPlaying || isReadyToPlay;
      console.log(`Video playback filter:`, {
        isPlaying,
        isReadyToPlay,
        pass,
        currentTime: video.currentTime,
        paused: video.paused,
        ended: video.ended,
        readyState: video.readyState,
        duration: video.duration
      });
      return pass;
    })
    .sort((v1, v2) => {
      const v1Rect = v1.getClientRects()[0] || { width: 0, height: 0 };
      const v2Rect = v2.getClientRects()[0] || { width: 0, height: 0 };
      return ((v2Rect.width * v2Rect.height) - (v1Rect.width * v1Rect.height));
    });

  console.log(`Final filtered videos count: ${videos.length}`);
  console.log("=== PIP getVideos() END ===");

  if (videos.length === 0) return [];
  return videos;
}

// --- [ FUNCTION: Req PiP Player ] --- //
export async function requestPictureInPicture(video: HTMLVideoElement) {
  console.log("requestPictureInPicture called with video:", {
    paused: video.paused,
    readyState: video.readyState,
    currentTime: video.currentTime
  });

  // Don't start paused videos - respect user's pause action
  if (video.paused) {
    console.log("Video is paused - skipping PiP (respecting user's pause action)");
    return false;
  }
  if (isPipPlayingInWindow()) {
    console.log("PiP is already active in the current document!")
    return false;
  }

  console.log("Attempting to request Picture-in-Picture...");
  try {
    await video.requestPictureInPicture();
    console.log("Picture-in-Picture request successful");
    video.setAttribute('__pip__', "");
    video.addEventListener('leavepictureinpicture', event => {
      video.removeAttribute('__pip__');
      console.log("Left Picture-in-Picture mode");
    }, { once: true });
    new ResizeObserver(maybeUpdatePictureInPictureVideo).observe(video);
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.log("PiP requires user gesture - will show prompt on current tab");
      showActivationPrompt()
      return false;
    } else {
      console.error("Picture-in-Picture request failed:", error);
      return false;
    }
  }
}

// --- [ FUNCTION: Update PiP Video ] --- //
function maybeUpdatePictureInPictureVideo(entries, observer) {
  for (let observedVideo of entries.map(entry => entry.target)) {
    if (!document.querySelector('[__pip__]')) {
      observer.unobserve(observedVideo);
      return "Update";
    }
    if (observedVideo && !observedVideo.hasAttribute('__pip__')) {
      observer.unobserve(observedVideo);
      requestPictureInPicture(observedVideo);
    }
  }
}

// --- [ FUNCTION: Exit PiP ] --- //
export function exitPictureInPicture() {
  try {
    if (!isPipPlayingInWindow) return false;
    document.exitPictureInPicture().then(() => { })
  }
  catch (error) { }
  return true;
}

// --- [ FUNCTION: PiP Active Query ] --- //
export function isPipPlayingInWindow() {
  return document.pictureInPictureElement
}

function showActivationPrompt() {
  // Show UI hint that user needs to interact
  
}