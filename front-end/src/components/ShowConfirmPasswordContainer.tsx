import { EyeSlashIcon } from "@heroicons/react/24/solid";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";

export default function ShowConfirmPasswordContainer({ children, showConfirmPassword, setShowConfirmPassword }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, showConfirmPassword: boolean, setShowConfirmPassword: (value: boolean) => void }) {
    return (
        <div className="relative flex items-center justify-end text-gray-600">
            {children}
            {showConfirmPassword ?
                <button type="button" aria-label="Show password button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="toggleConfirmPasswordTypePasswordButton" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}>
                    <EyeIcon className="w-6 h-6" />
                </button>
                :
                <button type="button" aria-label="Hide password button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="toggleConfirmPasswordTypeTextButton" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }}>
                    <EyeSlashIcon className="w-6 h-6" />
                </button>
            }
        </div>
    )
}