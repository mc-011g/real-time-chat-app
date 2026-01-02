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
                return "bg-gray-700";
        }
    }

    const sizeSelector = () => {
        switch (size) {
            case "small":
                return "w-12 h-12 min-w-12 min-h-12";
            case "large":
                return "aspect-square md:size-32 md:min-w-32 md:min-h-32 text-2xl sm:text-3xl md:text-4xl sm:size-24 sm:min-w-24 sm:min-h-24 size-16 min-w-16 min-h-16";
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
        <div {...props} className={`${backgroundColorSelector()} ${sizeSelector()} rounded-[100%] text-white flex items-center justify-center`}>
            <span className="flex">{getUserInitials()}</span>
        </div>
    )
}
