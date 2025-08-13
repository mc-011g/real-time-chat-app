import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Modal({ title, children, setShowModal }: { title: string, children: React.ReactNode, setShowModal: (value: boolean) => void }) {
    return (
        <>
            <div className="flex items-center absolute w-full h-full justify-center">
                <div className="w-[100vw] h-[100vh] absolute opacity-50 bg-black z-80" onClick={() => setShowModal(false)}></div>
                <div className="bg-white h-fit max-h-120 w-80 z-81 rounded-xl text-black p-6 flex flex-col gap-4 shadow-xl">

                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-2xl">{title}</h1>
                        <XMarkIcon className="w-6 h-6 text-gray-600 hover:cursor-pointer" onClick={() => setShowModal(false)} data-cy="modalCloseButton" />
                    </div>

                    <hr />

                    {children}

                </div>
            </div>
        </>
    )
}