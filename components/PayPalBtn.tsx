'use client'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

interface PayPalBtnProps {
    amount: string;
    courseTitle: string;
    onSuccess: () => void;
}

export function PayPalBtn({ amount, courseTitle, onSuccess }: PayPalBtnProps) {
    const [consentGiven, setConsentGiven] = useState(false);

    const initialOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: "EUR",
        intent: "capture",
    };

    return (
        <div className="space-y-3">
            {/* Checkbox Consenso Accesso Immediato */}
            <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-600 leading-snug select-none">
                <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                />
                <span>
                    Acconsento all'accesso immediato al contenuto digitale e riconosco che, una volta sbloccato, perderò il diritto di recesso ai sensi dell'art. 59 D.Lgs. 206/2005.
                </span>
            </label>

            {/* PayPal Buttons - disabled if no consent */}
            <div className={consentGiven ? "" : "opacity-50 pointer-events-none"}>
                <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                        style={{ layout: "horizontal", color: "gold", tagline: false }}
                        disabled={!consentGiven}
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
            </div>
        </div>
    );
}
