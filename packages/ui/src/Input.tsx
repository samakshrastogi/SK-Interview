import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label ? (
          <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">
            {label}
          </label>
        ) : null}
        
        <div className="relative flex items-center">
          {icon ? (
            <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          ) : null}
          
          <input
            ref={ref}
            className={`
              w-full rounded-xl text-sm transition-all outline-none
              bg-white/50 dark:bg-darkbg-card/50 backdrop-blur-md
              border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-white/10 focus:border-brand-500 dark:focus:border-brand-400 focus:ring-brand-500/20'}
              focus:ring-4
              text-slate-800 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              ${icon ? 'pl-11 pr-4' : 'px-4'}
              py-3
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <span className="text-xs font-medium text-red-500 mt-0.5">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
