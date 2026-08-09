"use client";

import { useEffect, useRef } from "react";
import { BASE_URL, getAccessToken } from "@lib/api/client";

// Live order updates via SSE (GET /api/orders/events). The server scopes the
// stream to the signed-in user's role, so a single listener is enough per
// screen — every event is a hint to re-fetch the affected data through the
// normal authenticated API (events carry ids only, never the full payload).
//
// EventSource can't send an Authorization header, so the token rides the
// query string. On any connection error the stream closes and reopens after
// a short backoff with the *current* token from localStorage — which is what
// lets it survive a background access-token refresh (the axios interceptor
// swaps the stored token, and reconnect picks it up).
export function useOrderEvents(onEvent) {
  const handlerRef = useRef(onEvent);

  // Keep the latest handler without re-opening the connection; the `current`
  // write stays in an effect so it never happens during render (refs rule).
  useEffect(() => {
    handlerRef.current = onEvent;
  });

  useEffect(() => {
    let source;
    let retryTimer;
    let disposed = false;

    const connect = () => {
      const token = getAccessToken();
      if (!token) return;

      source = new EventSource(
        `${BASE_URL}/orders/events?token=${encodeURIComponent(token)}`,
      );

      source.onmessage = (event) => {
        try {
          handlerRef.current(JSON.parse(event.data));
        } catch {
          // Keep-alive/comment frames never reach here; ignore malformed data.
        }
      };

      source.onerror = () => {
        if (disposed) return;
        source?.close();
        retryTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, []);
}
