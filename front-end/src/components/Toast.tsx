import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Toast({ children, closeToast }: { children: React.ReactNode, closeToast: (value: boolean) => void }) {

    return (
        <div className="w-screen h-screen absolute transition duration-3000 ease-in-out">
            <div className="w-fit bg-white px-4 py-2 rounded-xl absolute border z-40 border-gray-300 bottom-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-2">{children}</div>
                <XMarkIcon className="ml-2 w-6 h-6 text-gray-600 hover:cursor-pointer" onClick={() => closeToast(false)} />
            </div>
        </div>
    )
}
