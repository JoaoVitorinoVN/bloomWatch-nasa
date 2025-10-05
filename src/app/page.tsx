'use client'
import { useRouter } from 'next/navigation'
import ActionButton from './components/ui/ActionButton'


export default function Home() {
    const router = useRouter()
    return (
        <main className='min-h-dvh grid place-items-center bg-[url("/png/folhasBackground.png")] bg-cover bg-center h-64'>
            <div className="backdrop-blur-md bg-white/10 text-white rounded-3xl p-8 shadow-2xl max-w-xl w-[92%]">
                <h1 className="text-3xl font-bold mb-2 text-center">BloomWatch</h1>
                <p className="opacity-90 mb-6 text-center">
                    A beleza da flora brasileira resumida em uma pequena tela.
                </p>

                <div className="flex gap-3 transition-all">
                    <ActionButton
                        variant='default'
                        onClick={() => router.push('/map?mode=geo')}
                    >
                        Usar minha localização
                    </ActionButton>

                    <ActionButton
                        onClick={() => router.push('/map?mode=select')}
                    >
                        Escolher região no mapa
                    </ActionButton>

                    <ActionButton
                        variant='dark'
                        onClick={() => router.push('/map?mode=season')}
                    >
                        Explorar por estação
                    </ActionButton>
                </div>

                <p className="text-xs mt-6 opacity-80">
                    Dica: sua localização funciona em HTTPS (ou localhost) e pede permissão do navegador.
                </p>
            </div>
        </main>
    )
}
