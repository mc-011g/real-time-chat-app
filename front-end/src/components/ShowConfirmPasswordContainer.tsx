import { EyeSlashIcon } from "@heroicons/react/24/solid";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";

export default function ShowConfirmPasswordContainer({ children, showConfirmPassword, setShowConfirmPassword }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, showConfirmPassword: boolean, setShowConfirmPassword: (value: boolean) => void }) {
    return (
        <div className="relative flex items-center justify-end text-gray-600">
            {children}
            {showConfirmPassword ?
                <EyeIcon className="w-6 h-6 absolute mr-4 z-10 hover:cursor-pointer" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }} />
                :
                <EyeSlashIcon className="w-6 h-6 absolute mr-4 z-10 hover:cursor-pointer" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }} />
            }
        </div>
    )
}
