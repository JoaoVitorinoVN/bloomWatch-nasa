'use client'

import Footer from '@/components/Footer'
import GlassButton from '@/components/ui/GlassButton'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
    const router = useRouter()
    return (
        <div>
            <main className="min-h-dvh grid place-items-center bg-[url('/images/background.png')] bg-cover bg-center">
                <div className="border-white/20 border backdrop-blur-md bg-white/10 rounded-3xl p-8 shadow-2xl w-[92%] text-yellow-950 flex justify-around items-center">
                    <div className="max-w-3xl p-10">
                        <h1 className="text-6xl font-medium mb-10">BloomWatch</h1>
                        <p className="opacity-90 mb-6">
                            BloomWatch is a <b>interactive platform</b> dedicated to accompany the <b>process of blooming plants around Brazil</b>. Offering an <b>visual education experience</b> about the natural cycles and impact of climate changes for the flora.🌼
                        </p>
                        <GlassButton onClick={() => router.push('/ui')} variant="dark">
                            Start Exploring!
                        </GlassButton>
                    </div>
                    <div className="grid gap-3">
                        <h2 className="text-4xl font-medium mb-2">Candy Monkeys</h2>
                        <p className="opacity-70 mb-6">We just like banana flavoured candy</p>
                        <GlassButton
                            onClick={() =>
                                (window.location.href =
                                    'https://www.spaceappschallenge.org/2025/find-a-team/candy_monkeys/?tab=members')
                            }
                            variant="dark"
                        >
                            Meet us members!
                        </GlassButton>
                    </div>
                </div>

                {/* Substitui <img> por next/image */}
                <Image
                    src="/bee.svg"
                    alt="bee"
                    width={200}
                    height={200}
                    className="absolute -bottom-2 right-0 w-[10%] transition-all ease-in-out hover:scale-110 hover:-translate-x-4 hover:-translate-y-4 hover:-rotate-6 hover:saturate-150"
                    priority
                />
            </main>

            <Footer />
        </div>
    )
}
