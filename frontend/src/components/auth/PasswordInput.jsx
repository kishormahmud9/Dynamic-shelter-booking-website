import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordInput({
    id,
    label,
    value,
    onChange,
    placeholder,
    disabled,
    required = true,
    className = '',
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`pr-12 border-primary focus-visible:border-primary focus-visible:ring-primary/50 ${className}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:opacity-80 focus:outline-none"
                    disabled={disabled}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                    ) : (
                        <FaEye className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
