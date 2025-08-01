import { useContext, useEffect, useRef, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, ArrowUturnLeftIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { getAuth, sendPasswordResetEmail, signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { getUser } from "../redux/selectors";
import type { ToastType, User } from "../types/types";
import { updateUserProfileDataThunk } from "../redux/thunks/updateProfileDataThunk";
import { useAppDispatch } from "../hooks/useAppDispatch";
import Toast from "../components/Toast";
import { socket } from "../socket";
import { UserContext } from "../context/UserContext";
import UserImageContainer from "../components/UserImageContainer";
import ChangeEmailModal from "../components/modals/ChangeEmailModal";

export default function ProfilePage() {

    const userData = useSelector(getUser);
    const auth = getAuth();

    const [toast, setToast] = useState<ToastType | null>(null);
    const toastTimer = useRef<number | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
    const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [showChangeEmailModal, setChangeEmailModal] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const user = useContext(UserContext);
    const dispatch = useAppDispatch();

    interface InitialFormData {
        email: string,
        firstName: string,
        lastName: string
    }

    const [initialFormData, setInitialFormData] = useState<InitialFormData | null>(null);
    const [initialFormDataChanged, setInitialFormDataChanged] = useState<boolean>(false);


    useEffect(() => {
        if (toast) {
            if (toastTimer.current) {
                clearTimeout(toastTimer.current);
            }
            const startTimer = () => {
                toastTimer.current = setTimeout(() => {
                    setToast(null);
                    toastTimer.current = null;
                }, 5000) as unknown as number;
            }
            startTimer();
        }
    }, [toast]);

    const handleSaveChange = async () => {
        if (!firstName || !lastName) {
            setError('Failed to save profile.');
            return;
        }
        setIsSavingProfile(true);

        if (!user || !user.email) {
            return;
        }

        if (user.email && user.email.length > 0) {
            const formData: User = {
                _id: userData._id,
                firstName,
                lastName,
                email: user.email,
            }

            const result = await dispatch(updateUserProfileDataThunk(user, formData));

            if (result?.success) {
                const { user } = result;
                socket.emit('update-group-participant', user);
                setToast({ id: 5, success: true, message: "Profile saved." });
                setError("");
            } else {
                setError(result?.error);
            }
        } else {
            setError('Failed to update email. Please try again.');
        }

        setIsSavingProfile(false);
    }

    useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName);
            setLastName(userData.lastName);

            setInitialFormData({
                email: userData.email as string,
                firstName: userData.firstName,
                lastName: userData.lastName
            });
        }
    }, [userData]);

    useEffect(() => {
        if (initialFormData) {
            if (firstName !== initialFormData.firstName ||
                lastName !== initialFormData.lastName) {
                setInitialFormDataChanged(true);
            } else {
                setInitialFormDataChanged(false);
            }
        }
    }, [firstName, initialFormData, lastName]);

    const resetProfileData = () => {
        if (initialFormData) {
            setFirstName(initialFormData.firstName);
            setLastName(initialFormData.lastName);
        }
    }

    const handleSendPasswordResetEmail = () => {     
        if (userData && userData.email && auth) {
            try {
                setIsSendingEmail(true);
                sendPasswordResetEmail(auth, userData.email);
                setMessage('Password reset link sent successfully.');
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsSendingEmail(false);
            };
        }
    }

    return (
        <div className="flex justify-center place-items-center h-[100vh] sm:bg-gray-50">
            {toast &&
                <Toast closeToast={() => setToast(null)}>
                    <>
                        {toast.success ?
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            :
                            <XMarkIcon className="size-6 text-red-500" />
                        }
                        <span className="text-gray-900">{toast.message}</span>
                    </>
                </Toast>
            }

            {showChangeEmailModal &&
                <ChangeEmailModal setChangeEmailModal={setChangeEmailModal} />
            }

            <form className="flex flex-col gap-4 bg-white py-8 sm:py-16 px-16 sm:shadow-lg z-50 w-screen h-screen sm:w-fit sm:h-fit" onSubmit={e => { e.preventDefault(); handleSaveChange(); }}>
                <Link to={"/"} className="flex sm:hidden flex-row gap-2 hover:cursor-pointer text-gray-900 w-full mb-8" >
                    <ArrowUturnLeftIcon className="size-6 text-gray-600" />      
                </Link>

                <div className="flex flex-row items-center relative justify-center relative">
                    <Link to={"/"} className="absolute hidden sm:flex flex-row gap-2 hover:cursor-pointer text-gray-900 w-33 left-0 top-0 w-fit" >
                        <ArrowUturnLeftIcon className="size-6 text-gray-600" />              
                    </Link>               

                    <div className="flex flex-col gap-2 items-center text-center">
                        {userData &&
                            <UserImageContainer bgColor={userData.bgColor as string} firstName={userData.firstName} lastName={userData.lastName} size="large" />
                        }
                        <div className="text-gray-600 text-2xl">{userData.firstName} {userData.lastName}</div>                  
                    </div>
                </div>          

                <div className="flex flex-col gap-4">
                      <label>
                            <div className="text-gray-600">Edit Picture</div>
                            <div className="w-25">
                                <Input type={"file"} extraClasses="hover:cursor-not-allowed" disabled />
                            </div>
                        </label>
                    <div className="flex flex-row flex-wrap gap-4">
                        <div className="w-fit h-fit">
                            <Button variant={"primary-outline"} type="button" disabled={isSendingEmail} onClick={() => handleSendPasswordResetEmail()}>
                                <div className="flex flex-row gap-2 items-center justify-center place-items-center">
                                    {isSendingEmail &&
                                        <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    }
                                    <div>Reset Password</div>
                                </div>
                            </Button>
                        </div>
                        <div className="w-fit h-fit">
                            <Button variant={"primary-outline"} type="button" disabled={isSendingEmail} onClick={() => setChangeEmailModal(true)}>
                                <div className="flex flex-row gap-2 items-center justify-center place-items-center">
                                    {isSendingEmail &&
                                        <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    }
                                    <div>Update Email</div>
                                </div>
                            </Button>
                        </div>
                    </div>
                    {message &&
                        <div className="text-green-600">{message}</div>
                    }
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <label>
                        <span className="text-gray-600">First Name</span>
                        <Input placeholder={"First Name"} type={"text"} value={firstName} onChange={(e) => (setFirstName(e.target.value))} minLength={2} required />
                    </label>
                    <label>
                        <span className="text-gray-600">Last Name</span>
                        <Input placeholder={"Last Name"} type={"text"} value={lastName} onChange={(e) => (setLastName(e.target.value))} minLength={2} required />
                    </label>
                </div>

                {initialFormDataChanged &&
                    <div className="flex flex-col gap-4 my-4">
                        <div className="flex flex-row gap-2">
                            <Button variant={"primary-solid"} type="submit" disabled={isSavingProfile}>
                                <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                                    {isSavingProfile &&
                                        <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    }
                                    <div>Save Changes</div>
                                </div>
                            </Button>
                            <Button variant={"primary-outline"} type="button" onClick={() => resetProfileData()}>Reset</Button>
                        </div>
                    </div>
                }

                {error &&
                    <div className="text-red-600">{error}</div>
                }

                <div className="w-fit flex self-start mt-6">
                    <Button variant="danger-outline" onClick={() => signOut(getAuth())} extraClasses="flex justify-center gap-2">
                        <ArrowRightStartOnRectangleIcon className="size-6" />
                        <span className="">Logout</span>
                    </Button>
                </div>
            </form>
        </div>
    )
}

