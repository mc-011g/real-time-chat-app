import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function NotFoundPage() {
    return (
        <main className="w-screen h-screen flex flex-col justify-center items-center sm:bg-gray-50">
            <div className="bg-white py-16 px-4 sm:px-8 flex flex-col gap-4 sm:rounded-lg sm:shadow-xl items-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-950 font-bold ">404 Page Not Found</h1>
                <Link to={'/'}>
                    <Button variant={"primary-solid"}>Back to Chat</Button>
                </Link>
            </div>
        </main>
    )
}