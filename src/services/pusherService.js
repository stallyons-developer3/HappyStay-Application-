if (typeof document === 'undefined') {
  global.document = {
    body: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {} }),
    getElementsByTagName: () => [],
    readyState: 'complete',
  };
}

if (typeof window === 'undefined') {
  global.window = global;
}

if (typeof window.addEventListener === 'undefined') {
  window.addEventListener = () => {};
}

if (typeof window.removeEventListener === 'undefined') {
  window.removeEventListener = () => {};
}

const Pusher = require('pusher-js');

const PUSHER_APP_KEY = '5bd4eb52921be3a9b5b7';
const PUSHER_APP_CLUSTER = 'ap2';

let pusherInstance = null;
const channelRefs = {};

export const getPusher = () => {
  if (!pusherInstance) {
    const PusherClass = Pusher.default || Pusher;
    pusherInstance = new PusherClass(PUSHER_APP_KEY, {
      cluster: PUSHER_APP_CLUSTER,
      forceTLS: true,
    });
  }
  return pusherInstance;
};

/**
 * Subscribe to a channel and bind a callback.
 * Returns a cleanup function that safely unbinds only this callback
 * and only truly unsubscribes the channel when the last subscriber leaves.
 */
export const subscribeToChannel = (channelName, eventName, callback) => {
  const pusher = getPusher();
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);
  channelRefs[channelName] = (channelRefs[channelName] || 0) + 1;

  // Return a cleanup function for this specific binding
  const cleanup = () => {
    const ch = pusher.channel(channelName);
    if (ch) {
      ch.unbind(eventName, callback);
    }
    channelRefs[channelName] = Math.max(0, (channelRefs[channelName] || 0) - 1);
    if (channelRefs[channelName] === 0) {
      pusher.unsubscribe(channelName);
      delete channelRefs[channelName];
    }
  };

  return cleanup;
};

/**
 * @deprecated Use the cleanup function returned by subscribeToChannel instead.
 * Force-unsubscribes a channel regardless of ref count (use only for full disconnect).
 */
export const unsubscribeFromChannel = channelName => {
  const pusher = getPusher();
  pusher.unsubscribe(channelName);
  delete channelRefs[channelName];
};

export const disconnectPusher = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    Object.keys(channelRefs).forEach(key => delete channelRefs[key]);
  }
};

export const initPusher = getPusher;

export default getPusher;
