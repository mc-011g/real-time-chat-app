import { useContext, useState } from "react";
import Button from "../components/Button";
import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { UserContext } from "../context/UserContext";
import { getAuth, sendEmailVerification, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export default function PleaseVerifyEmailPage() {

    const navigate = useNavigate();
    const [sentEmail, setSentEmail] = useState<boolean>(false);
    const user = useContext(UserContext);

    const handleResendVerificationEmail = () => {
        if (user) {
            //Allow only real users to get the verification email
            if (!user.emailVerified && !(import.meta.env.MODE === "test" && user.email && user.email.includes("+test"))) {
                sendEmailVerification(user);
            }

            setSentEmail(true);
            signOut(getAuth());
        }
    }

    const handleBackButtonAction = () => {
        if (user && !user.emailVerified) {
            signOut(getAuth());
        }
        navigate('/login');
    }

    return (
        <main className="flex justify-center place-items-center h-[100vh] sm:bg-gray-50 sm:px-8 px-0">

            <div className="flex relative flex-col items-center text-gray-800 gap-4 bg-white py-16 px-4 sm:px-8 sm:shadow-lg">
                <button type="button" aria-label="Back to login button" className="absolute top-8 left-8 flex flex-row items-center cursor-pointer" onClick={handleBackButtonAction} data-cy="backToLoginButton">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>

                <EnvelopeIcon className="w-30 h-30" />

                <h1 className="text-xl sm:text-2xl md:text-3xl">Please Verify Your Email</h1>

                <p>To complete registration, please verify your email. Check your inbox for a verification link.</p>

                {!sentEmail ?
                    <Button type="button" variant={"primary-outline"} className="w-fit" onClick={handleResendVerificationEmail} data-cy="resendEmailButton">
                        Resend Verification Link
                    </Button>
                    :
                    <div className="text-green-700" data-cy="resendEmailMessage">
                        Email verification link sent successfully.
                    </div>
                }
            </div>
        </main>
    )
}