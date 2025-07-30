import { type ReactNode } from "react";

export default function DropdownList({ children, dropdownSide, extraClasses, dropDownRef, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode, dropdownSide: string, extraClasses?: string, dropDownRef?: React.Ref<HTMLDivElement> }) {

    return (
        <div ref={dropDownRef} {...props} className={`${extraClasses} grid grid-cols-[auto_1fr] text-gray-600 shadow-xl bg-white py-2
        rounded-xl overflow-hidden absolute ${dropdownSide === "left" && "-left-6"} ${dropdownSide === "right" && ""}`}>
            {children}
        </div>
    )
}
