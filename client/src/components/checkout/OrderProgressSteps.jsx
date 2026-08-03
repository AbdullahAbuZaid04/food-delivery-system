// src/components/checkout/OrderProgressSteps.jsx
// Thin adapter — the Order Confirmation page keeps calling this component with
// `activeStep` (0 = order just placed), but the actual progress-steps visual now
// lives in components/orders/OrderProgressSteps.jsx (shared with the per-order
// tracking page, AGENTS.md §3/§12). This maps the old index API onto the shared
// `timeline` prop so both screens stay on ONE implementation.
import OrderProgressSteps, {
  ORDER_PROGRESS_STEPS,
} from "@components/orders/OrderProgressSteps";

export default function CheckoutOrderProgressSteps({ activeStep = 0 }) {
  const timeline = ORDER_PROGRESS_STEPS.map((step, index) => ({
    step,
    completed: index < activeStep,
    timestamp: null,
  }));

  return <OrderProgressSteps timeline={timeline} />;
}
