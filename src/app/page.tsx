'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    return (
        <main className="min-h-dvh grid place-items-center bg-gradient-to-br from-fuchsia-500 via-emerald-500 to-sky-500">
            <div className="backdrop-blur-md bg-white/10 text-white rounded-3xl p-8 shadow-2xl max-w-xl w-[92%]">
                <h1 className="text-3xl font-bold mb-2">Flores do Brasil</h1>
                <p className="opacity-90 mb-6">
                    Descubra flores por estação e região — escolha como quer entrar:
                </p>

                <div className="grid gap-3">
                    <button
                        onClick={()=>router.push('/map?mode=geo')}
                        className="w-full py-3 rounded-xl bg-white text-slate-900 font-semibold"
                    >
                        Usar minha localização
                    </button>

                    <button
                        onClick={()=>router.push('/map?mode=select')}
                        className="w-full py-3 rounded-xl bg-white/90 text-slate-900 font-semibold"
                    >
                        Escolher região no mapa
                    </button>

                    <button
                        onClick={()=>router.push('/map?mode=season')}
                        className="w-full py-3 rounded-xl bg-black/30 text-white font-semibold border border-white/30"
                    >
                        Explorar por estação
                    </button>
                </div>

                <p className="text-xs mt-6 opacity-80">
                    Dica: sua localização funciona em HTTPS (ou localhost) e pede permissão do navegador.
                </p>
            </div>
        </main>
    )
}
