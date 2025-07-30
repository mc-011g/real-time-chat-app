import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import Input from "../components/Input";
import { useState } from "react";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import type { Message } from "../types/types";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const auth = getAuth();

  const [message, setMessage] = useState<Message | null>(null);

  const handleSendEmail = () => {
    try {
      setIsSendingEmail(true);
      sendPasswordResetEmail(auth, email);
      setMessage({ content: 'Password reset link sent successfully. Check your inbox.', success: true });
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ content: error.message, success: false });
      } else {
        setMessage({ content: 'An unknown error occurred.', success: false });
      }
    } finally {
      setIsSendingEmail(false);
    };
  }

  return (
    <div className="flex justify-center place-items-center h-[100vh] sm:bg-gray-50 text-gray-900">

      <div className="flex flex-col gap-4 bg-white p-8 sm:shadow-xl rounded-xl">

        <Link to={"/login"} className="flex flex-row gap-2 mb-2 hover:cursor-pointer" >
          <ArrowUturnLeftIcon className="size-6 text-gray-600" />
          <span className="text-gray-600">Back to Login</span>
        </Link>

        <h1 className="text-3xl">Forgot Password</h1>

        <p className="text-gray-600">Please enter your email address to get a password reset link.</p>

        <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }} className="flex flex-col gap-4">
          <label>
            <span className="text-gray-600">Email</span>
            <Input type={"email"} placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <Button variant={"primary-solid"} disabled={!email || isSendingEmail}>
            <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
              {isSendingEmail &&
                <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
              }
              <div>Submit</div>
            </div>
          </Button>
        </form>

        {email &&
          <span className="text-green-600">{message?.content}</span>
        }
      </div>
    </div >
  )
}