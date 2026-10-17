import { useState, useEffect } from "react";

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение как PWA
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      );
    };

    if (checkStandalone()) {
      setIsInstalled(true);
    }

    // Слушаем событие установки
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Слушаем успешную установку
    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return null;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setInstallPrompt(null);
    }

    return result;
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    promptInstall,
  };
};
