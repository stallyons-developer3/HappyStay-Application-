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

export const subscribeToChannel = (channelName, eventName, callback) => {
  const pusher = getPusher();
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);
  return channel;
};

export const unsubscribeFromChannel = channelName => {
  const pusher = getPusher();
  pusher.unsubscribe(channelName);
};

export const initPusher = getPusher;

export default getPusher;
