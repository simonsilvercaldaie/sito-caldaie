// Sezione "Chi è Simon Silver" - Social Proof
// Mostra credibilità e autorevolezza nel settore

import Link from "next/link"
import { Youtube, Award, Users, Clock, Building2 } from "lucide-react"

export default function AboutSimonSection() {
    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Chi è Simon Silver
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Un tecnico che lavora sul campo ogni giorno e condivide quello che impara.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">20</p>
                        <p className="text-sm text-gray-500">Anni sul campo</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Building2 className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">15</p>
                        <p className="text-sm text-gray-500">Anni di P.IVA</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Youtube className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">25K+</p>
                        <p className="text-sm text-gray-500">Iscritti YouTube</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary">CNA</p>
                        <p className="text-sm text-gray-500">Partner formativo</p>
                    </div>
                </div>

                {/* Descrizione e collaborazioni */}
                <div className="grid md:grid-cols-2 gap-8 items-start">

                    {/* Bio */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent" />
                            Esperienza Sul Campo
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            Da 20 anni riparo caldaie. Ho iniziato come apprendista e oggi gestisco
                            la mia attività di assistenza tecnica. Nel tempo ho capito che i problemi
                            delle caldaie si ripetono: diagnosi sbrigate, ricambi cambiati a caso,
                            mancanza di metodo.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Per questo ho iniziato a fare video: per condividere quello che funziona
                            davvero sul campo, senza teoria inutile. Procedure reali, errori comuni,
                            soluzioni testate.
                        </p>
                    </div>

                    {/* Collaborazioni */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-accent" />
                            Collaborazioni
                        </h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="font-bold text-blue-800">Accademia Impiantisti CNA Lombardia</p>
                                <p className="text-sm text-blue-600">
                                    Video formativi su F-Gas, norme UNI, diagnosi caldaie e pompe di calore
                                </p>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2 px-4">
                                <li>• Analisi di Combustione & Tiraggio</li>
                                <li>• Trattamento Acqua (UNI 8065)</li>
                                <li>• Prova Tenuta Impianti Gas (UNI 7129)</li>
                                <li>• Corso Pompe di Calore</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
