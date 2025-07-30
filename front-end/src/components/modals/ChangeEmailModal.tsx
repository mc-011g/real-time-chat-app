import { useContext, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Modal from "./Modal";
import { UserContext } from "../../context/UserContext";
import { verifyBeforeUpdateEmail } from "firebase/auth";

export default function ChangeEmailModal({ setChangeEmailModal }:
    {
        setChangeEmailModal: (value: boolean) => void,
    }) {

    const user = useContext(UserContext);
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isChangingEmail, setIsChangingEmail] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const handleChangeEmail = async () => {
        setIsChangingEmail(true);

        if (!user) {
            return;
        }

        if (email !== user.email) {
            verifyBeforeUpdateEmail(user, email).then(() => {
                setMessage("A verification email has been sent to the new email. Please check your inbox and log in again.");
                return;
            }).catch((error) => {
                // const errorCode = error.code;
                setError('Failed to update email. Please try logging in again.' + error);
            });
        }

        setIsChangingEmail(false);
    }

    return (
        <Modal title={"Update Email"} setShowModal={() => setChangeEmailModal(false)}>
            <form className="flex flex-col justify-between h-full gap-4" onSubmit={e => { e.preventDefault(); handleChangeEmail(); }}>
                <label>
                    <span className="text-gray-600">Current Email</span>
                    <div>{user?.email}</div>
                </label>

                <label>
                    <span className="text-gray-600">New Email</span>
                    <Input placeholder={"Email Address"} type={"email"} value={email}
                        onChange={(e) => (setEmail(e.target.value))} minLength={2} required />
                </label>

                <Button variant={"primary-solid"} type="submit"
                    disabled={!email || isChangingEmail}
                >
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isChangingEmail &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Submit</div>
                    </div>
                </Button>

                {message &&
                    <div className="text-green-600">{message}</div>
                }
                {error &&
                    <div className="text-red-600">{error}</div>
                }
            </form>
        </Modal>
    )
}