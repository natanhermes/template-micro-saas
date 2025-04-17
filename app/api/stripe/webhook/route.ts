import stripe from "@/app/lib/stripe"
import { handleStripeCancelSubscription } from "@/app/server/stripe/handle-cancel"
import { handleStripePayment } from "@/app/server/stripe/handle-payment"
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const secret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
	try {
		const body = await request.text()
		const headersList = await headers()
		const signature = headersList.get("stripe-signature")

		if (!signature || !secret) {
			return NextResponse.json({ error: "No signature" }, { status: 400 })
		}

		const event = stripe.webhooks.constructEvent(body, signature, secret)

		switch (event.type) {
			case "checkout.session.completed": // pagamento realizado se status = paid - pode ser assinatura ou pagamento único
				const metadata = event.data.object.metadata

				if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
					await handleStripePayment(event)
				}
				if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
					await handleStripeSubscription(event)
				}
				break
			case "checkout.session.expired": // expirou o prazo de pagamento
				console.log("Enviar mensagem para o usuário avisando que o pagamento expirou")
				break
			case "checkout.session.async_payment_succeeded": // boleto pago
				console.log("Enviar mensagem para o usuário avisando que o pagamento foi realizado")
				break
			case "checkout.session.async_payment_failed": // boleto falhou
				console.log("Enviar mensagem para o usuário avisando que o pagamento falhou")
				break
			case "customer.subscription.created": // criou assinatura
				console.log("Enviar mensagem para o usuário avisando que a assinatura foi criada")
				break
			case "customer.subscription.updated": // atualizou assinatura
				console.log("Enviar mensagem para o usuário avisando que a assinatura foi atualizada")
				break
			case "customer.subscription.deleted": // cancelar assinatura
				await handleStripeCancelSubscription(event)
				break
			default:
				console.log(`Unhandled event type ${event.type}`)
				break
		}
		return NextResponse.json({ message: "Webhook received" })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: "Webhook error" }, { status: 500 })
	}
}
