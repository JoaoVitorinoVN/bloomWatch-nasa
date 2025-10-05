'use client'
import Footer from '@/components/Footer';
import GlassHeader, { TabKey } from '@/components/GlassHeader';
import GlassButton from '@/components/ui/GlassButton'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter();
    return (<div>
        <main className='min-h-dvh grid place-items-center bg-[url("/images/background.png")] bg-cover bg-center'>
            <div className="border-white/20 border backdrop-blur-md bg-white/10 rounded-3xl p-8 shadow-2xl w-[92%] text-yellow-950 flex justify-around items-center">
                <div className='max-w-3xl p-10'>
                    <h1 className="text-6xl font-medium mb-10">BloomWatch</h1>
                    <p className="opacity-90 mb-6">
                        BloomWatch é uma <b>plataforma interativa</b> dedicada a acompanhar e celebrar o <b>processo de floração das plantas ao redor do mundo</b>, com foco especial na biodiversidade do Brasil. Oferecendo uma <b>experiência visual e educativa</b> sobre os ciclos naturais e o impacto das mudanças climáticas na flora global. 🌼
                    </p>
                    <GlassButton
                        onClick={() => router.push('/ui')}
                        variant='dark'
                    >
                        Comece a explorar!
                    </GlassButton>
                </div>
                <div className="grid gap-3">
                    <h2 className="text-4xl font-medium mb-2">Candy Monkeys</h2>
                    <p className="opacity-70 mb-6">
                        Trabalhados com softwares.
                    </p>
                    <GlassButton
                        onClick={() => window.location.href = 'https://www.spaceappschallenge.org/2025/find-a-team/candy_monkeys/?tab=members'}
                        variant='dark'
                    >
                        Conheça os membros!
                    </GlassButton>
                </div>

            </div>
            <img
                src="/bee.svg"
                alt="bee"
                className='absolute -bottom-2 right-0 w-1/10 transition-all ease-in-out hover:scale-110 hover:-translate-x-4 hover:-translate-y-4 hover:-rotate-6 hover:saturate-150'
            />
        </main>

        <Footer />
    </div>
    )
}
