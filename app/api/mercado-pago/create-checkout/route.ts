import mpClient from "@/app/lib/mercado-pago";
import { Preference } from "mercadopago";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { testeId, userEmail } = await request.json();

  try {
    const preference = new Preference(mpClient);

    const createdPreference = await preference.create({
      body: {
        external_reference: testeId, // isso impacta na pontuação do mercadopago -> referencia do pedido no meu sistema
        metadata: {
          testeId, // Essa variavel é convertida para snake_case -> teste_id
        },
        ...(userEmail && { payer: { email: userEmail } }), // importante para pontuação do mercadopago
        items: [
          {
            id: "",
            description: "",
            quantity: 1,
            unit_price: 1,
            currency_id: "BRL",
            category_id: "services",
          }
        ],
        payment_methods: {
          installments: 12,
          // excluded_payment_methods: [
          //   {
          //     id: "bolbradesco"
          //   },
          //   {
          //     id: "pec"
          //   }
          // ],
          // excluded_payment_types: [
          //   {
          //     id: "debit_card"
          //   },
          //   {
          //     id: "credit_card"
          //   }
          // ]
        },
        auto_return: "approved",
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
        },
      }
    })

    if (!createdPreference.id) {
      return NextResponse.json({ error: "Erro ao criar checkout com Mercado Pago" }, { status: 500 });
    }

    return NextResponse.json({ preferenceId: createdPreference.id, initPoint: createdPreference.init_point }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro ao criar checkout" }, { status: 500 });
  }
}

