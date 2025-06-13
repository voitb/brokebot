// A simple event emitter for cross-component communication
const createNanoEvents = () => ({
  events: {} as Record<string, Function[]>,
  emit(event: string, ...args: any[]) {
    (this.events[event] || []).forEach(i => i(...args));
  },
  on(event: string, cb: Function) {
    (this.events[event] = this.events[event] || []).push(cb);
    return () => (this.events[event] = (this.events[event] || []).filter(i => i !== cb));
  },
});

const emitter = createNanoEvents();
let isSynced = false;

export const useSyncStatus = () => {
  const React = require('react');
  const [synced, setSynced] = React.useState(isSynced);

  React.useEffect(() => {
    return emitter.on('sync-change', (newStatus: boolean) => {
      setSynced(newStatus);
    });
  }, []);

  const setIsSynced = (newStatus: boolean) => {
    if (isSynced !== newStatus) {
      isSynced = newStatus;
      emitter.emit('sync-change', isSynced);
    }
  };

  return { isSynced: synced, setIsSynced };
}; 