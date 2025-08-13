import { useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import ShowPasswordContainer from "../components/ShowPasswordContainer";
import ShowConfirmPasswordContainer from "../components/ShowConfirmPasswordContainer";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, validatePassword, deleteUser } from "firebase/auth";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

export default function RegisterPage() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isRegistrationInProgress, setIsRegistrationInProgress] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [passwordRequirementsMet, setPasswordRequirementsMet] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
    const [isFirstNameValid, setIsFirstNameValid] = useState<boolean>(false);
    const [isLastNameValid, setIsLastNameValid] = useState<boolean>(false);

    let uid: string;
    let registeredEmail: string | null;

    const navigate = useNavigate();

    type PasswordRequirements = {
        min8Chars: boolean,
        specialChar: boolean,
        lowerCaseChar: boolean,
        upperCaseChar: boolean,
        numericChar: boolean
    }

    const [passwordRequirementsState, setPasswordRequirementsState] = useState<PasswordRequirements | null>(null);

    useEffect(() => {
        const passwordRequirements = ({
            min8Chars: password.length >= 8,
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            lowerCaseChar: /[a-z]/.test(password),
            upperCaseChar: /[A-Z]/.test(password),
            numericChar: /[0-9]/.test(password)
        });

        setPasswordRequirementsState(passwordRequirements);
        setPasswordRequirementsMet(Object.values(passwordRequirements).every(Boolean));
    }, [password]);

    useEffect(() => {
        if (email) {
            setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        }
        if (firstName) {
            setIsFirstNameValid(firstName.length >= 2);
        }
        if (lastName) {
            setIsLastNameValid(lastName.length >= 2);
        }
    }, [email, firstName, lastName]);

    const register = async () => {
        if (password !== confirmPassword) {
            return;
        }

        //Validate password with Firebase auth
        const passValidationStatus = await validatePassword(getAuth(), password);

        if (!passValidationStatus.isValid) {
            setError('Password validation failed.');
        }

        setIsRegistrationInProgress(true);

        //Firebase register user
        await createUserWithEmailAndPassword(getAuth(), email, password).then(credentials => {
            setError("");
            const user = credentials.user;
            uid = user.uid;
            registeredEmail = user.email;

            if (!(import.meta.env.MODE === "test" && user.email && user.email.includes("+test"))) {
                sendEmailVerification(credentials.user);
            }
        }).catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/email-already-in-use") {
                setError('Email already in use.');
            } else if (errorCode === "auth/missing-email") {
                setError('Please enter a valid email.')
            } else if (errorCode === "auth/missing-password") {
                setError('Please enter a valid password.');
            } else {
                setError('Registration failed. Please try again.' + errorCode);
            }
            setIsRegistrationInProgress(false);
        });

        if (!uid) {
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/auth/register`, { id: uid, email: registeredEmail, firstName, lastName });
            navigate("/please-verify-email");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data.error);
            } else {
                setError("An unexpected error occurred.");
            }

            //Delete Firebase user if DB registration fails
            const currentUser = getAuth().currentUser;

            if (currentUser) {
                await deleteUser(currentUser);
            }
        } finally {
            setIsRegistrationInProgress(false);
        }
    }

    return (
        <div className="flex justify-center place-items-center min-h-screen sm:bg-gray-50">
            <form className="flex flex-col gap-4 bg-white py-16 px-8 sm:shadow-lg" onSubmit={(e) => { e.preventDefault(); register(); }}>
                <h1 className="text-3xl text-center mb-4 text-gray-900">Register</h1>
                <label>
                    <span className="text-gray-600">Email</span>
                    <Input placeholder={"Email Address"} type={"email"} value={email} onChange={(e) => (setEmail(e.target.value))} required data-cy="emailInput" />
                    {email && !isEmailValid &&
                        <div className="text-red-600" data-cy="invalidEmailMessage">Please enter a valid email address.</div>
                    }
                </label>

                <div className="flex flex-col sm:flex-row gap-4">
                    <label>
                        <span className="text-gray-600">First Name</span>
                        <Input placeholder={"First Name"} type={"text"} value={firstName} onChange={(e) => (setFirstName(e.target.value))} required data-cy="firstNameInput" />
                        {firstName && !isFirstNameValid &&
                            <div className="text-red-600" data-cy="invalidFirstNameMessage">First name must be at least 2 characters.</div>
                        }
                    </label>
                    <label>
                        <span className="text-gray-600">Last Name</span>
                        <Input placeholder={"Last Name"} type={"text"} value={lastName} onChange={(e) => (setLastName(e.target.value))} required data-cy="lastNameInput" />
                        {lastName && !isLastNameValid &&
                            <div className="text-red-600" data-cy="invalidLastNameMessage">Last name must be at least 2 characters.</div>
                        }
                    </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <label className="grow">
                        <span className="text-gray-600">Password</span>
                        <ShowPasswordContainer showPassword={showPassword} setShowPassword={setShowPassword}>
                            <Input placeholder={"Password"} type={showPassword ? "text" : "password"} value={password} onChange={(e) => (setPassword(e.target.value))}
                                required data-cy="passwordInput"
                            />
                        </ShowPasswordContainer>
                    </label>
                    <label className="grow">
                        <span className="text-gray-600">Confirm Password</span>
                        <ShowConfirmPasswordContainer showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}>
                            <Input placeholder={"Confirm Password"} type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => (setConfirmPassword(e.target.value))}
                                required data-cy="confirmPasswordInput"
                            />
                        </ShowConfirmPasswordContainer>
                    </label>
                </div>

                <div className="text-gray-800">
                    {password &&
                        <>
                            <div className="mb-2">Password requirements:</div>
                            <ul className="flex flex-col gap-2 sm:ml-2">
                                <li className="inline-flex gap-1">
                                    {passwordRequirementsState?.min8Chars ?
                                        <>
                                            <CheckCircleIcon className="min-w-6 max-w-6 text-green-600" />
                                            <span className="text-green-600">Must be at least 8 characters</span>
                                        </>
                                        :
                                        <>
                                            <XCircleIcon className="min-w-6 max-w-6 text-red-600" />
                                            <span className="text-red-600">Must be at least 8 characters</span>
                                        </>
                                    }
                                </li>
                                <li className="inline-flex gap-1">
                                    {passwordRequirementsState?.lowerCaseChar ?
                                        <>
                                            <CheckCircleIcon className="min-w-6 max-w-6 text-green-600" />
                                            <span className="text-green-600">At least one lowercase letter</span>
                                        </>
                                        :
                                        <>
                                            <XCircleIcon className="min-w-6 max-w-6 text-red-600" />
                                            <span className="text-red-600">At least one lowercase letter</span>
                                        </>
                                    }
                                </li>
                                <li className="inline-flex gap-1">
                                    {passwordRequirementsState?.upperCaseChar ?
                                        <>
                                            <CheckCircleIcon className="min-w-6 max-w-6 text-green-600" />
                                            <span className="text-green-600">At least one uppercase letter</span>
                                        </>
                                        :
                                        <>
                                            <XCircleIcon className="min-w-6 max-w-6 text-red-600" />
                                            <span className="text-red-600" data-cy="failedUppercaseRequirement">At least one uppercase letter</span>
                                        </>
                                    }
                                </li>
                                <li className="inline-flex gap-1">
                                    {passwordRequirementsState?.specialChar ?
                                        <>
                                            <CheckCircleIcon className="min-w-6 max-w-6 text-green-600" />
                                            <span className="text-green-600" data-cy="passedSpecialCharacterRequirement">At least one special character</span>
                                        </>
                                        :
                                        <>
                                            <XCircleIcon className="min-w-6 max-w-6 text-red-600" />
                                            <span className="text-red-600" data-cy="failedSpecialCharacterRequirement">At least one special character</span>
                                        </>
                                    }

                                </li>
                                <li className="inline-flex gap-1">
                                    {passwordRequirementsState?.numericChar ?
                                        <>
                                            <CheckCircleIcon className="min-w-6 max-w-6 text-green-600" />
                                            <span className="text-green-600">At least one numeric character</span>
                                        </>
                                        :
                                        <>
                                            <XCircleIcon className="min-w-6 max-w-6 text-red-600" />
                                            <span className="text-red-600">At least one numeric character</span>
                                        </>
                                    }
                                </li>
                            </ul>
                        </>
                    }
                </div>

                {password && password !== confirmPassword &&
                    <div className="text-red-600 mb-2" data-cy="notMatchingPasswordsMessage">Passwords must match.</div>
                }

                <Button variant={"primary-solid"} type="submit"
                    disabled={isRegistrationInProgress || !isEmailValid || !isFirstNameValid || !isLastNameValid || !passwordRequirementsMet || !(password === confirmPassword)}
                    data-cy="registerButton"
                >
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isRegistrationInProgress &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Register</div>
                    </div>
                </Button>

                {error &&
                    <p className="text-red-600" data-cy="errorMessage">{error}</p>
                }

                <p className="text-gray-600">Already have an account? <span className="text-gray-900 font-bold hover:cursor-pointer">
                    <Link to="/login" data-cy="loginLink">Login</Link>
                </span>
                </p>

            </form>
        </div>
    )
}