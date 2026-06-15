const CHANNEL_NAME = 'atelier-shop-catalog';

const TAB_ID = (() => {
  if (typeof sessionStorage === 'undefined') {
    return `tab-${Math.random().toString(36).slice(2)}`;
  }
  const key = 'atelier-shop-tab-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `tab-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
})();

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
  bc?.postMessage({ type: 'catalog-change', scope, sourceId: TAB_ID, at: Date.now() });
}

/** @param {(scope: 'goods' | 'categories' | 'orders' | 'all') => void} callback */
export function onCatalogChange(callback) {
  const bc = getChannel();
  if (!bc) return () => {};

  const handler = (event) => {
    if (event.data?.sourceId === TAB_ID) return;
    const scope = event.data?.scope;
    if (scope === 'goods' || scope === 'categories' || scope === 'orders' || scope === 'all') {
      callback(scope);
    }
  };

  bc.addEventListener('message', handler);
  return () => bc.removeEventListener('message', handler);
}

export const CATALOG_POLL_INTERVAL_MS = 15000;

/** 订单轮询间隔（用户端实时性） */
export const ORDER_POLL_INTERVAL_MS = 5000;
