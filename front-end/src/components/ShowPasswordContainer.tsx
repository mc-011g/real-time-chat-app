import { EyeSlashIcon } from "@heroicons/react/24/solid";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";

export default function ShowPasswordContainer({ children, showPassword, setShowPassword }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, showPassword: boolean, setShowPassword: (value: boolean) => void }) {
    return (
        <div className="relative flex items-center justify-end text-gray-600">
            {children}
            <div className="absolute z-10 bg-gray-200 px-4">
                {showPassword ?
                    <EyeIcon className="w-6 h-6 hover:cursor-pointer" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }} />
                    :
                    <EyeSlashIcon className="w-6 h-6 hover:cursor-pointer" onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }} />
                }
            </div>
        </div>
    )
}
