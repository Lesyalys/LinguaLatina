import { useState, useEffect } from "react";

// Запуск ли приложение как установленное PWA — проверяется один раз при
// инициализации состояния: matchMedia доступен уже на первом рендере,
// поэтому не нужно делать setState внутри эффекта.
const checkStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true);

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(checkStandalone);

  useEffect(() => {
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
