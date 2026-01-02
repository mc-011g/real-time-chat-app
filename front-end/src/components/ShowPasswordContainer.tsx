import { EyeSlashIcon } from "@heroicons/react/24/solid";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";

export default function ShowPasswordContainer({ children, showPassword, setShowPassword }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, showPassword: boolean, setShowPassword: (value: boolean) => void }) {
    return (
        <div className="relative flex items-center justify-end text-gray-600">
            {children}
            {showPassword ?
                <button type="button" aria-label="Show password button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="togglePasswordTypePasswordButton" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}>
                    <EyeIcon className="w-6 h-6" />
                </button>
                :
                <button type="button" aria-label="Hide password button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="togglePasswordTypeTextButton" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}>
                    <EyeSlashIcon className="w-6 h-6" />
                </button>
            }
        </div>
    )
}