// In-memory scoped pub/sub backing the SSE real-time channel
// (GET /api/orders/events). Scopes follow a flat `entity:id` scheme so a
// subscriber only hears events it is entitled to:
//   - `restaurant:<id>`  → an order is created/updated for that restaurant
//   - `driver:<id>`      → that driver is assigned or the delivery advances
//   - `customer:<id>`    → that customer's orders change
//   - `admin`            → every order event (admin stream)
//
// In-memory on purpose: the platform currently runs a single server process.
// If it is ever scaled horizontally (multiple Node instances), this must be
// swapped for a shared channel (Redis pub/sub) or events will be lost across
// instances.
const subscribers = new Map();

const subscribe = (scope, onEvent) => {
  if (!subscribers.has(scope)) {
    subscribers.set(scope, new Set());
  }
  const set = subscribers.get(scope);
  set.add(onEvent);

  return () => unsubscribe(scope, onEvent);
};

const unsubscribe = (scope, onEvent) => {
  const set = subscribers.get(scope);
  if (!set) return;
  set.delete(onEvent);
  if (set.size === 0) {
    subscribers.delete(scope);
  }
};

const publish = (scope, event) => {
  const set = subscribers.get(scope);
  if (!set) return;

  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const onEvent of set) {
    try {
      onEvent(payload);
    } catch {
      // Subscriber socket already gone; the close handler cleans up.
    }
  }
};

module.exports = { subscribe, publish };
