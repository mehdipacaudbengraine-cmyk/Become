import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
