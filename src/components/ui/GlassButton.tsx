import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'dark' | 'light';
type ButtonSize = 's' | 'l' | 'xl' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
    dark: 'bg-black/30 border-white/30 hover:bg-black/50 text-white',
    light: 'bg-white/40 dark:bg-white/10 text-slate-900/80 dark:text-white/80 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/20',
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

// 4. Componente Tipado
export default function GlassButton({
    children,
    variant = 'dark',
    className,
    ...rest
}: ActionButtonProps) {

    const baseClasses = `
    w-full py-3 rounded-xl font-semibold cursor-pointer border
    transition-all duration-300 ease-in-out 
    scale-100 hover:scale-95 p-10
    ${variantClasses[variant]}
    ${className || ''}
  `;

    return (
        <button
            className={`${baseClasses}`}
            {...rest}
        >
            {children}
        </button>
    );
}