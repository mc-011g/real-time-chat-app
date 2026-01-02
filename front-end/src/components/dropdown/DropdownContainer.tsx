import type { ReactNode } from "react";

export default function DropdownContainer({ children }: { children: ReactNode }) {

    return (
        <div className="relative flex z-10">
            <div>{children}</div>
        </div>
    )
}
