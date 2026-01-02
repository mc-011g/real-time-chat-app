import type { ReactNode } from "react";

export default function DropdownItem({ extraClasses, children, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>
    & {
        extraClasses?: string,
        onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void,
        children: ReactNode
    }) {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick?.(e);
        }
    }

    return (
        <div {...props} onClick={onClick} onKeyDown={handleKeyDown} role="button" tabIndex={0} className={` ${extraClasses} hover:bg-gray-100 focus:bg-gray-100 hover:text-gray-950 focus:text-gray-950 hover:cursor-pointer py-2 px-4 grid grid-cols-subgrid col-span-2 items-center gap-2`}>
            {children}
        </div>
    )

}
