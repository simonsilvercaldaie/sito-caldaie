'use client'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { UI_PAYMENTS_ENABLED, PAYPAL_CLIENT_ID, PAYPAL_ENV } from "@/lib/constants";

interface PayPalBtnProps {
    amount: string;
    courseTitle: string;
    onSuccess: (orderId: string) => void;
    onProcessing?: () => void;     // Called immediately when PayPal approves (before capture)
    showDisclaimer?: boolean;
    productCode?: string;
}

export function PayPalBtn({ amount, courseTitle, onSuccess, onProcessing, showDisclaimer = true, productCode }: PayPalBtnProps) {

    // Pagamenti disabilitati: mostra messaggio
    if (!UI_PAYMENTS_ENABLED) {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <p className="font-bold text-orange-800 mb-1">Pagamenti temporaneamente non disponibili</p>
                <p className="text-xs text-orange-700">
                    Stiamo configurando il sistema. Riprova più tardi.
                </p>
            </div>
        );
    }

    const initialOptions = {
        clientId: PAYPAL_CLIENT_ID || "test",
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
                                    custom_id: productCode || undefined,
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        // Show processing overlay IMMEDIATELY when PayPal approves
                        if (onProcessing) onProcessing();
                        
                        if (actions.order) {
                            const order = await actions.order.capture();
                            console.log("Order Successful:", order);
                            if (order.id) {
                                onSuccess(order.id);
                            } else {
                                console.error("Order ID mancante");
                                alert("Errore: ID ordine non ricevuto da PayPal.");
                            }
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
            {showDisclaimer && (
                <p className="text-xs text-gray-500 text-center mt-1">
                    Questo accesso è personale e nominativo. Per team o aziende, contattaci per le licenze dedicate.
                </p>
            )}
            <p className="text-xs text-blue-600 text-center mt-2 font-medium">
                📱 Max 2 dispositivi · Cambio: 1×/mese dal tuo Account
            </p>
            {PAYPAL_ENV === 'sandbox' && (
                <p className="text-xs text-amber-600 text-center font-semibold">
                    ⚠️ Ambiente di test (sandbox)
                </p>
            )}
        </div>
    );
}
