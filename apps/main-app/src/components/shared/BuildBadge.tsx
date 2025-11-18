const getEnv = () => {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  return {
    version: env.VITE_APP_VERSION ?? '0.0.0',
    buildTime: env.VITE_BUILD_TIME ?? 'dev',
    mode: env.MODE ?? 'development',
    pwa: env.VITE_ENABLE_PWA === 'true' ? 'on' : 'off',
  };
};

export default function BuildBadge() {
  const { version, buildTime, mode, pwa } = getEnv();

  let formatted = buildTime;
  try {
    const d = new Date(buildTime);
    if (!isNaN(d.getTime())) {
      formatted = d.toLocaleString();
    }
  } catch {
    // ignore
  }

  return (
    <div
      aria-label="Build information"
      className="fixed bottom-3 right-3 z-30 select-none rounded-md bg-black/70 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur pointer-events-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="font-mono">v{version}</span>
      <span className="mx-1.5 opacity-60">•</span>
      <span className="opacity-90">{formatted}</span>
      <span className="mx-1.5 opacity-60">•</span>
      <span className="uppercase opacity-90">{mode}</span>
      <span className="mx-1.5 opacity-60">•</span>
      <span className="opacity-90">PWA: {pwa}</span>
    </div>
  );
}