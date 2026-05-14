import type { Metadata } from "next";
import { PaymentFlow } from "@/components/PaymentFlow";
import { Troubleshooter } from "@/components/Troubleshooter";

export const metadata: Metadata = {
  title: "How a Payment Works — Chase Whittaker",
  description:
    "An interactive walkthrough of the payment lifecycle, from card tap to settlement. Built by someone who spent 6 years helping merchants go live.",
};

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <PaymentFlow />
      <div className="mt-16">
        <Troubleshooter />
      </div>
    </div>
  );
}
