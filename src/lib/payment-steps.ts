import type { PaymentStep } from "./types";

export const paymentSteps: PaymentStep[] = [
  {
    id: "cardholder",
    label: "Cardholder",
    shortDescription: "Customer taps, dips, or swipes their card",
    detailedExplanation:
      "The transaction starts when a cardholder presents their payment method. That could be a physical card tap (NFC/EMV contactless), chip dip, magnetic stripe swipe, or a digital wallet like Apple Pay. The POS terminal reads the card data (PAN, expiration, CVV for card-not-present) and packages it into an authorization request. For e-commerce, the customer enters card details into a checkout form, and the merchant's integration captures the data via a payment gateway's JavaScript SDK or hosted payment page.",
    icon: "CreditCard",
  },
  {
    id: "pos-terminal",
    label: "POS / Checkout",
    shortDescription: "Terminal or checkout page captures card data",
    detailedExplanation:
      "The POS terminal (in-store) or checkout page (online) encrypts the card data and sends it to the payment gateway. In a card-present environment, the terminal handles EMV chip communication, PIN entry, and contactless protocols. Online, the gateway's SDK tokenizes the card number before it ever hits the merchant's server. That's how PCI scope stays small. The terminal or SDK builds the authorization request with the amount, currency, merchant ID, and encrypted card data.",
    icon: "Monitor",
  },
  {
    id: "gateway",
    label: "Payment Gateway",
    shortDescription: "Routes the transaction to the right processor",
    detailedExplanation:
      "The payment gateway (Authorize.Net, Stripe, Braintree, Adyen) receives the authorization request from the merchant's integration. It validates the request format, applies fraud filters (AVS, CVV checks, velocity rules), and routes it to the appropriate payment processor. The gateway is the translation layer. It speaks the merchant's API language on one side and the processor's ISO 8583 or proprietary protocol on the other. This is where most integration failures happen: malformed requests, missing fields, or incorrect API credentials.",
    icon: "Server",
  },
  {
    id: "processor",
    label: "Processor / Acquirer",
    shortDescription: "Acquirer forwards to the card network",
    detailedExplanation:
      "The payment processor (also called the acquirer or acquiring bank) has the direct relationship with the card networks. It receives the formatted authorization request from the gateway and forwards it to the appropriate card network (Visa, Mastercard, Amex, Discover) based on the card's BIN (Bank Identification Number, the first 6-8 digits). The processor also handles settlement batching, funding, and chargeback management. Companies like Fiserv, Worldpay, and Global Payments operate at this layer.",
    icon: "Building2",
  },
  {
    id: "card-network",
    label: "Card Network",
    shortDescription: "Visa/MC routes between acquirer and issuer",
    detailedExplanation:
      "The card network (Visa, Mastercard, American Express, Discover) acts as the central switch. It routes the authorization request from the acquirer to the cardholder's issuing bank, and routes the response back. The network sets interchange rates (the fee the issuer charges the acquirer per transaction), enforces network rules, and provides the infrastructure for cross-border transactions. The network doesn't hold funds. It's the routing and rules layer. Visa's VisaNet processes ~65,000 transactions per second at peak.",
    icon: "Network",
  },
  {
    id: "issuing-bank",
    label: "Issuing Bank",
    shortDescription: "Cardholder's bank approves or declines",
    detailedExplanation:
      "The issuing bank (Chase, Capital One, Citi, whoever gave the cardholder their card) receives the authorization request and makes the approve/decline decision. It checks: Does the account exist? Is the card active? Is there sufficient credit or funds? Does the transaction trigger fraud rules? If approved, it places a hold on the cardholder's available balance for the authorized amount. The issuer returns an authorization code (approval) or a decline reason code back through the network. Common decline codes: insufficient funds (51), do not honor (05), expired card (54).",
    icon: "Landmark",
  },
  {
    id: "auth-response",
    label: "Authorization Response",
    shortDescription: "Approved or declined. Response flows back.",
    detailedExplanation:
      "The authorization response travels the reverse path: issuing bank → card network → processor → gateway → merchant. The entire round trip typically takes 1-3 seconds. The response includes an authorization code (if approved), the AVS result (address verification), CVV match result, and any network-specific response data. The merchant's system stores this authorization code; it's needed later for capture (settlement). An authorization is NOT a charge. It's a promise that the funds are available. Authorizations expire (typically 7-30 days depending on the merchant category).",
    icon: "ArrowLeftRight",
  },
  {
    id: "settlement",
    label: "Settlement",
    shortDescription: "Funds move from issuer to merchant",
    detailedExplanation:
      "Settlement is when money actually moves. The merchant (or their gateway) sends a batch of captured transactions to the processor, typically at end of day. The processor forwards to the card networks, which calculate interchange fees and route the net amounts. The issuing bank debits the cardholder's account; the acquiring bank credits the merchant's bank account minus fees (interchange + assessment + processor markup). The merchant sees funds in their account 1-3 business days after batch close. This is also when the cardholder sees the charge move from 'pending' to 'posted' on their statement.",
    icon: "Banknote",
  },
];
