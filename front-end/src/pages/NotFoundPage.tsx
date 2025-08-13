import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function NotFoundPage() {
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-50">
            <div className="bg-white p-16 flex flex-col gap-4 rounded-xl shadow-xl items-center">
                <h1 className="text-3xl text-gray-900 ">404 page not found</h1>
                <Link to={'/'}>
                    <Button variant={"primary-solid"}>Back to Chat</Button>
                </Link>
            </div>
        </div>
    )
}