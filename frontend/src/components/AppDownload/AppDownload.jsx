import React, { useEffect, useState } from "react";
import "./AppDownload.css";
import { assets } from "../../asset/assets";

const AppDownload = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Detect iOS + installed mode
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    // Android/Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    console.log("PWA install choice:", choiceResult);

    setDeferredPrompt(null);
  };

  return (
    <div className="app-download" id="mobile-app">
      <p>
        For Better Experience Download <br />
        <b>LADYB RESIN ART GALLERY</b>
      </p>

      {/* If already installed */}
      {isStandalone && (
        <p className="install-note success">
          ✅ App is already installed on your device.
        </p>
      )}

      {/* Android/Chrome install button */}
      {!isStandalone && deferredPrompt && (
        <button className="install-btn" onClick={handleInstallClick}>
          Install App
        </button>
      )}

      {/* iPhone instructions */}
      {!isStandalone && isIOS && (
        <div className="ios-install-box">
          <p className="install-note">
            📌 On iPhone: Tap the <b>Share</b> button, then select{" "}
            <b>"Add to Home Screen"</b>.
          </p>
        </div>
      )}

      {/* Store images (optional design only unless you publish real apps) */}
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="Google Play Store" />
        <img src={assets.app_store} alt="Apple App Store" />
      </div>

      <p className="store-note">
        (Play Store & App Store links will work only if you publish real mobile apps.)
      </p>
    </div>
  );
};

export default AppDownload;
