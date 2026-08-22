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
