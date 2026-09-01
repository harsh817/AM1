export const META_PIXEL_ID = "2647411082380065";
export const CLARITY_PROJECT_ID = "xx2rulxltt";

const META_PIXEL_SCRIPT_ID = "meta-pixel-sdk";
const CLARITY_SCRIPT_ID = "clarity-sdk";
const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const CLARITY_SRC = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

/**
 * Loads Meta Pixel and Microsoft Clarity after the app can render.
 *
 * @param {Window | undefined} windowRef Browser window-like object.
 * @returns {boolean} True when analytics initialization ran for this page.
 */
export function initializeAnalytics(windowRef = globalThis.window) {
  const documentRef = windowRef?.document;

  if (!documentRef || windowRef.__attractiveMenAnalyticsInitialized) {
    return false;
  }

  windowRef.__attractiveMenAnalyticsInitialized = true;
  initializeMetaPixel(windowRef, documentRef);
  initializeClarity(windowRef, documentRef);
  return true;
}

function initializeMetaPixel(windowRef, documentRef) {
  if (!windowRef.fbq) {
    const fbq = function pixelQueue() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
        return;
      }

      fbq.queue.push(arguments);
    };

    if (!windowRef._fbq) windowRef._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    windowRef.fbq = fbq;
  }

  insertAsyncScript(documentRef, META_PIXEL_SCRIPT_ID, META_PIXEL_SRC);

  if (!windowRef.__attractiveMenMetaPageViewTracked) {
    windowRef.fbq("init", META_PIXEL_ID);
    windowRef.fbq("track", "PageView");
    windowRef.__attractiveMenMetaPageViewTracked = true;
  }
}

function initializeClarity(windowRef, documentRef) {
  if (!windowRef.clarity) {
    windowRef.clarity = function clarityQueue() {
      (windowRef.clarity.q = windowRef.clarity.q || []).push(arguments);
    };
  }

  insertAsyncScript(documentRef, CLARITY_SCRIPT_ID, CLARITY_SRC);
}

function insertAsyncScript(documentRef, id, src) {
  if (documentRef.getElementById(id)) return;

  const script = documentRef.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;

  const firstScript = documentRef.getElementsByTagName("script")[0];

  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
    return;
  }

  documentRef.head?.appendChild(script);
}
