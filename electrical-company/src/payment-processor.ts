import customers from './customer-list.json';
import { Customer, sendMessage } from "./message-service";
import { traceparent } from "tctx";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const traceId = traceparent.make().toString();

// Process all customer payments
(async function processPayments() {
  customers.forEach(async (customer: Customer) => {
    try {
      await processCustomerPayment(customer);
      console.log(`Successfully processed payment for customer ${customer.id}`);
    } catch (error) {
      handlePaymentError(customer, error);
    }
  });
})();

async function processCustomerPayment(customer: Customer) {
  const paymentMethod = getCustomerPaymentMethod(customer);
  const paymentAmount = getCustomerPaymentAmount(customer.id);

    // Generate a unique ID for the payment attempt
	const paymentAttemptId = uuidv4();  // I just want to show that a unique ID of the transaction/payment attempt would be appropriate

  const response = await axios.post('https://api.stripe.com/some-payment-endpoint', {
    customerId: customer.id,
    paymentMethod,
    amount: paymentAmount,
	paymentAttemptId, // Optionally send the UUID with the request if needed
  }, {
    headers: {
      "Content-Type": "application/json",
      "Traceparent": traceId,
      "Authorization": `Bearer ${process.env.STRIPE_API_KEY}`
    }
  });

  if (response.status !== 200) {
    throw response.data;
  }

  return response.data;
}

function getCustomerPaymentMethod(customer: Customer) {
  const defaultMethod = customer.paymentMethods.methods.find(
    (method) => method.type === customer.paymentMethods.default
  );
  return defaultMethod;
}

function getCustomerPaymentAmount(customerId: number) {
  const amount = Math.random() * (100 - 50) + 50;
  return amount.toFixed(2);
}

function handlePaymentError(customer: Customer, error: any) {
  console.error(`The payment failed to process: ${error.message}`);
  if (error.message === 'Payment Failed') {
    const paymentMethod = getCustomerPaymentMethod(customer);
    const last4Digits = paymentMethod?.last4.toString();
    sendMessage(customer, last4Digits);
  }
}
