import { traceparent } from "tctx";
import nodemailer from 'nodemailer';

export type Customer = {
  id: number;
  name: string;
  contact: {
    email?: string;
    mobile?: {
      number: string;
      carrier?: string;
    };
  };
  paymentMethods: {
    default: string;
    methods: PaymentMethod[];
  };
};

type PaymentMethod = {
	type: string;
	brand?: string;
	last4?: string | number;
	bankName?: string;
	accountType?: string;
	iban_last_4?: string;
  };

const transporter = nodemailer.createTransport({
	service: 'gmail', // or another service
	auth: {
	  user: process.env.EMAIL_USER,
	  pass: process.env.EMAIL_PASS,
	},
  });

// Send failure notification
export function sendMessage(customer: Customer, accountNumberLast4?: string) {
  const message = createFailureMessage(customer, accountNumberLast4);
  const recipients = getRecipients(customer);

  if (recipients.length > 0) {
    const emailPayload = {
      from: 'paymentprocessing@aep.com',
      to: recipients,
	  subject: 'Payment Processing Failure',
      text: message
    };

    sendEmail(emailPayload);
  }
}

function createFailureMessage(customer: Customer, last4Digits?: string): string {
  const paymentMethod = customer.paymentMethods.methods.find(
    (method) => method.last4 === last4Digits
  );

  if (!paymentMethod) return '';

  const { type, brand, bankName, iban_last_4 } = paymentMethod;
  return `Hello, ${customer.name},\nYour payment using your ${type === 'card' 
	? brand : (type === 'usBankAccount' 
		? bankName : 'IBAN')} ending in ${last4Digits} failed. Please verify your payment details.`;
}


function getRecipients(customer: Customer): string[] {
	const email = customer.contact.email;
	const mobileNumber = customer.contact.mobile?.number;
	
	return email 
	  ? [email] 
	  : mobileNumber 
		? [`${mobileNumber}@text.att.net`, `${mobileNumber}@tmomail.net`, `${mobileNumber}@vtext.com`] 
		: [];
}

async function sendEmail(emailPayload: { from: string; to: string[]; subject: string; text: string }) {
	try {
	  await transporter.sendMail(emailPayload);
	  console.log('Email sent successfully!');
	} catch (err) {
	  console.warn('Error sending message:', err);
	}
  }
