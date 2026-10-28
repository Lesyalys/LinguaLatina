import { usePWAInstall } from "../../hooks/usePWAInstall";

const InstallPWAButton = () => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled || !canInstall) return null;

  return (
    <button
      className="pwa-install-btn"
      onClick={promptInstall}
      title="Установить приложение"
    >
      📲 Установить
    </button>
  );
};

export default InstallPWAButton;
