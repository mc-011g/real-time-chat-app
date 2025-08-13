import { EyeSlashIcon } from "@heroicons/react/24/solid";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";

export default function ShowConfirmPasswordContainer({ children, showConfirmPassword, setShowConfirmPassword }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode, showConfirmPassword: boolean, setShowConfirmPassword: (value: boolean) => void }) {
    return (
        <div className="relative flex items-center justify-end text-gray-600">
            {children}
            {showConfirmPassword ?
                <button type="button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="toggleConfirmPasswordTypePasswordButton">
                    <EyeIcon className="w-6 h-6" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }} />
                </button>
                :
                <button type="button" className="absolute z-10 bg-transparent mx-4 hover:cursor-pointer" data-cy="toggleConfirmPasswordTypeTextButton">
                    <EyeSlashIcon className="w-6 h-6" onClick={(e) => { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); }} />
                </button>
            }
        </div>
    )
}