import { XMarkIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef } from "react";

export default function Modal({ title, children, setShowModal }: { title: string, children: React.ReactNode, setShowModal: (value: boolean) => void }) {

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const modalNode = modalRef.current;
        if (!modalNode) {
            return;
        }

        modalNode.focus();

        const focusableSelectors = 'button, input';
        const focusableElements = modalNode.querySelectorAll<HTMLElement>(focusableSelectors)
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                if (focusableElements.length === 0) {
                    e.preventDefault();
                    return;
                }
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            if (e.key === "Escape") {
                setShowModal(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [setShowModal]);

    return (
        <>
            <div className="flex items-center absolute w-full h-full justify-center text-gray-950">
              
                <div className="fixed inset-0 opacity-75 bg-black z-80" aria-hidden="true" onClick={() => setShowModal(false)}></div>

                <div ref={modalRef} aria-modal="true" role="dialog" aria-label={`${title} Modal`} className="bg-white h-full sm:h-fit sm:max-h-120 w-full sm:w-96 z-81 sm:rounded-lg text-black p-8 flex flex-col gap-4 shadow-xl">

                    <div className="flex flex-row justify-between items-center">
                        <h1 className="text-2xl">{title}</h1>

                        <button type="button" className="text-gray-600 focus:text-gray-950 hover:cursor-pointer hover:text-gray-950 focus:text-gray-950" aria-label="Close modal button" onClick={() => setShowModal(false)} data-cy="modalCloseButton">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <hr className="text-gray-600" />

                    {children}

                </div>
            </div>
        </>
    )
}