"use client"

import { useStripe } from "@/app/hooks/useStripe"

export default function Payments() {

    const { createPaymentStripeCheckout, createSubscriptionStripeCheckout, handleCreateStripePortal } = useStripe()

    return (
        <div className="flex flex-col gap-6 items-center justify-center h-screen">
            <h1>Payments</h1>
            <div className="flex gap-4">
                <button onClick={() => createPaymentStripeCheckout({ testeId: "123" })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Create Payments</button>
                <button onClick={() => createSubscriptionStripeCheckout({ testeId: "123" })} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Create Subscription</button>
                <button onClick={handleCreateStripePortal} className="cursor-pointer bg-blue-500 text-white p-2 rounded-md">Create Portal</button>
            </div>
        </div>
    )
}
