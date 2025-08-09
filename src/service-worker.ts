//import { MessageCodes } from "./model/definitions"
const MessageCodes = {
    RequestPip: 0,
    ExitPipInTab: 1,
    TabActivated: 2
}

var currentTab = 0;
var autoPipEnabled = true; // Default to enabled

async function init() {
  await initServiceWorkerState()

  // Load settings on startup
  loadSettings();

  //setup service worker listeners
  setupListeners()
}

async function initServiceWorkerState() {
  let tab = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  currentTab = tab?.[0]?.id ?? 0
}

// Helper function to check if a URL is restricted (chrome://, chrome-extension://, etc.)
function isRestrictedUrl(url) {
  if (!url) return true;
  const restrictedProtocols = ['chrome:', 'chrome-extension:', 'chrome-search:', 'chrome-devtools:', 'moz-extension:', 'edge:', 'about:'];
  return restrictedProtocols.some(protocol => url.startsWith(protocol));
}

// Helper function to load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['autoPipEnabled']);
    autoPipEnabled = result.autoPipEnabled !== false; // Default to enabled
    console.log('Loaded auto-PiP setting:', autoPipEnabled);
  } catch (error) {
    console.error('Error loading settings:', error);
    autoPipEnabled = true; // Default to enabled
  }
}


function safeExecuteScriptAllFrames(tabId, files, callback) {
  // First check if the tab exists and get its URL
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.log("Tab access error:", chrome.runtime.lastError.message);
      if (callback) callback(null);
      return;
    }

    if (isRestrictedUrl(tab.url)) {
      console.log("Skipping restricted URL:", tab.url);
      if (callback) callback(null);
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: files
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.log("Script execution error:", chrome.runtime.lastError.message);
        if (callback) callback(null);
        return;
      }
      if (callback) callback(results);
    });
  });
}

function setupListeners() {
  // Set default settings on first install
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      console.log('Extension installed - setting default auto-PiP to enabled');
      try {
        await chrome.storage.sync.set({ autoPipEnabled: true });
        autoPipEnabled = true;
        console.log('Default auto-PiP setting saved');
      } catch (error) {
        console.error('Error setting default auto-PiP setting:', error);
      }
    }

  });

  // user switched to new tab
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (currentTab === null || currentTab === 0)
      return

    await sendMessageToTab(activeInfo.tabId, { "code": MessageCodes.ExitPipInTab })
    await sendMessageToTab(activeInfo.tabId, {"code": MessageCodes.TabActivated})
    await sendMessageToTab(currentTab, { "code": MessageCodes.RequestPip })

    currentTab = activeInfo.tabId
  }
  );
}

async function sendMessageToTab(tabId: number, message: object) {
  try {
    await chrome.tabs.sendMessage(tabId, message)
  } catch (error) {
    console.log(`Could not send message to tab ${currentTab}:`, error.message);
  }
}

init()