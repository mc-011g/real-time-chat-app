import type { ReactNode } from "react";

export default function DropdownItem({ extraClasses, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { extraClasses?: string, children: ReactNode }) {

    return (
        <div {...props} className={` ${extraClasses} hover:bg-gray-100 hover:cursor-pointer py-2 px-4 grid grid-cols-subgrid col-span-2 items-center gap-2`}>
            {children}
        </div>
    )

}
