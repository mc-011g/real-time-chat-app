export default function UserImageContainer({ firstName, lastName, bgColor, size, ...props }: React.HTMLAttributes<HTMLDivElement> & { firstName: string, lastName: string, bgColor: string, size: string }) {

    const backgroundColorSelector = () => {
        switch (bgColor) {
            case "orange":
                return "bg-orange-700";
            case "blue":
                return "bg-blue-700";
            case "red":
                return "bg-red-700";
            case "green":
                return "bg-green-700";
            default:
                return "bg-gray-900";
        }
    }

    const sizeSelector = () => {
        switch (size) {
            case "small":
                return "w-12 h-12 min-w-12 min-h-12";
            case "large":
                return "w-30 h-30 min-w-20 min-h-20 text-3xl";
            default:
                return "w-12 h-12 min-w-12 min-h-12";
        }
    }

    const getUserInitials = () => {
        if (firstName && lastName) {
            return firstName.charAt(0) + lastName.charAt(0);
        }
    }

    return (
        <div {...props} className={`${backgroundColorSelector()} ${sizeSelector()} rounded-[100%] text-white flex items-center justify-center hover:cursor-pointer`}>
            <span className="flex">{getUserInitials()}</span>
        </div>
    )
}
