import { useEffect, useState } from 'react';
import { systemApi } from '../api/systemApi';

const clientVersion = import.meta.env.VITE_APP_VERSION || 'unknown';

export default function VersionBadge() {
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let cancelled = false;
    systemApi
      .fetchVersion()
      .then((version) => {
        if (!cancelled) setServerVersion(version);
      })
      .catch(() => {
        if (!cancelled) setServerVersion(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="version-badge" title="Development build versions">
      <span>client {clientVersion}</span>
      <span className="version-badge__sep" aria-hidden>
        ·
      </span>
      <span>server {serverVersion ?? '—'}</span>
    </div>
  );
}
