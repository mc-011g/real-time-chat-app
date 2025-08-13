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

    return (
        <div className="flex justify-center place-items-center h-[100vh] sm:bg-gray-50">

            <div className="flex relative flex-col items-center text-gray-800 gap-4 bg-white py-16 px-8 sm:shadow-lg">
                <div className="absolute top-8 left-8 flex flex-row gap-2 items-center cursor-pointer" onClick={() => navigate('/login')} data-cy="backToLoginButton">
                    <ArrowLeftIcon className="w-6 h-6" />
                </div>

                <EnvelopeIcon className="w-30 h-30" />
                <h1 className="text-3xl">Please Verify Your Email</h1>
                <p>To complete registration, please verify your email. Check your inbox for a verification link.</p>
                {!sentEmail ?
                    <Button variant={"primary-outline"} className="w-fit" onClick={handleResendVerificationEmail} data-cy="resendEmailButton">
                        Resend Verification Link
                    </Button>
                    :
                    <div className="text-green-800" data-cy="resendEmailMessage">
                        Email verification link sent successfully.
                    </div>
                }
            </div>
        </div>
    )
}