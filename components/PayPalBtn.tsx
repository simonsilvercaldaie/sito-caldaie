'use client'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalBtnProps {
    amount: string;
    courseTitle: string;
    onSuccess: () => void;
}

export function PayPalBtn({ amount, courseTitle, onSuccess }: PayPalBtnProps) {

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: "EUR",
        intent: "capture",
    };

    return (
        <div className="space-y-2">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: "horizontal", color: "gold", tagline: false }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    description: courseTitle,
                                    amount: {
                                        value: amount,
                                        currency_code: "EUR"
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            const order = await actions.order.capture();
                            console.log("Order Successful:", order);
                            onSuccess();
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("Si è verificato un errore con PayPal. Se stai testando con lo stesso account del venditore, PayPal potrebbe bloccarlo. Prova con una carta diversa.");
                    }}
                    onCancel={() => {
                        console.log("Pagamento annullato dall'utente");
                        alert("Hai annullato il pagamento.");
                    }}
                />
            </PayPalScriptProvider>
            <p className="text-xs text-gray-400 text-center">
                Procedendo acconsenti all'accesso immediato al contenuto.
            </p>
        </div>
    );
}
