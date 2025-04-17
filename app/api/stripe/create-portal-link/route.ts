import { auth } from "@/app/lib/auth"
import { db } from "@/app/lib/firebase"
import stripe from "@/app/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	const session = await auth()

	const userId = session?.user?.id

	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	try {
		const userRefDb = db.collection("users").doc(userId)
		const userDoc = await userRefDb.get()

		if (!userDoc.exists) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		const stripeCustomerId = userDoc.data()?.stripeCustomerId

		if (!stripeCustomerId) {
			return NextResponse.json({ error: "Customer ID not found" }, { status: 404 })
		}
		
		const portalSession = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId,
			return_url: `${request.headers.get("origin")}/dashboard`,
		})

		return NextResponse.json({ url: portalSession.url }, { status: 200 })

	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}