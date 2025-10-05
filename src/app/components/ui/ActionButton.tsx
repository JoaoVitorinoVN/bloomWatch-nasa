import React, { ButtonHTMLAttributes, ReactNode } from 'react'

// Adicione a variante aqui:
type ButtonVariant = 'default' | 'dark' | 'secondary';

// Contextualize-a aqui:
const variantClasses: Record<ButtonVariant, string> = {
    default: 'bg-white/60 border-black/50 hover:bg-white/90 text-gray-800',
    dark: 'bg-black/60 border-white/30 hover:bg-black/50 text-white',
    secondary: '',
}

// Interface para atribuir os parâmetros do botão
interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    className?: string; 
}

// Botão de ação customizado.
// Pre-estilizado, facilmente configurável.
// Serve para facilitar a implementação de estilos novos e padronizar o estilo visual do projeto.
const ActionButton = ({children, variant = 'default', ...rest}: ActionButtonProps) => {

    const buttonStyle = `w-full py-3 rounded-xl font-semibold cursor-pointer border transition-all duration-300 ease-in-out scale-100 hover:scale-95 ${variantClasses[variant]}`;

    return (
        <button
            className={buttonStyle}
            {...rest}
        >
            {children}
        </button>
    )
}

export default ActionButton
