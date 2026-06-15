const CHANNEL_NAME = 'atelier-shop-catalog';

let channel = null;

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

/** @param {'goods' | 'categories' | 'orders' | 'all'} scope */
export function broadcastCatalogChange(scope) {
  const bc = getChannel();
  bc?.postMessage({ type: 'catalog-change', scope, at: Date.now() });
}

/** @param {(scope: 'goods' | 'categories' | 'orders' | 'all') => void} callback */
export function onCatalogChange(callback) {
  const bc = getChannel();
  if (!bc) return () => {};

  const handler = (event) => {
    const scope = event.data?.scope;
    if (scope === 'goods' || scope === 'categories' || scope === 'orders' || scope === 'all') {
      callback(scope);
    }
  };

  bc.addEventListener('message', handler);
  return () => bc.removeEventListener('message', handler);
}

export const CATALOG_POLL_INTERVAL_MS = 15000;
