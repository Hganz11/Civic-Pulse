type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export function subscribeToast(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Shows a short message at the bottom of the screen. Works on web and phones. */
export function showToast(message: string) {
  listeners.forEach((listener) => listener(message));
}
