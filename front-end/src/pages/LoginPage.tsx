import { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import ShowPasswordContainer from "../components/ShowPasswordContainer";
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useSelector } from "react-redux";
import { getUser } from "../redux/selectors";
import { UserContext } from "../context/UserContext";
import { GoogleAuthProvider } from "firebase/auth";
import SignInWithGoogleButton from "../components/SignInWithGoogleButton";
import axios from "axios";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { loginThunk } from "../redux/thunks/loginThunk";

export default function LoginPage() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const navigate = useNavigate();
    const userData = useSelector(getUser);
    const user = useContext(UserContext);

    const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean>(false);

    const provider = new GoogleAuthProvider();
    const dispatch = useAppDispatch();

    const signInWithGoogle = async () => {
        await signInWithPopup(getAuth(), provider).then(async (result) => {
            const user = result.user;
            const [firstName, lastName] = user.displayName ? user.displayName.split(" ") : ["", ""];

            await axios.post(`${import.meta.env.VITE_API_URL}/api/users/auth/register`, { id: user.uid, email: user.email, firstName, lastName }).then(async () => {
                await dispatch(loginThunk(user));
                setLoginSuccess(true);
            }).catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response && error.response.status === 400 &&
                    error.response.data?.error === "A user exists with this email already.") {
                    navigate("/");
                }
            });
        }).catch((error) => {
            const errorMessage = error.message;
            console.log("Error: " + errorMessage);
        });
    };

    const login = () => {
        setIsLoggingIn(true);

        try {
            const firebaseSignIn = async () => {
                await signInWithEmailAndPassword(getAuth(), email, password).then((userCredential) => {
                    const user = userCredential.user;

                    if (!user.emailVerified && !(import.meta.env.MODE === "test" && user.email && user.email.includes("+test1"))) {
                        navigate("/please-verify-email");
                        return;
                    }

                    setLoginSuccess(true);

                }).catch((error) => {
                    const errorCode = error.code;

                    if (errorCode === "auth/invalid-credential") {
                        setError('Invalid username or password.');
                    } else {
                        setError('Login failed. Please try again.');
                    }

                    setIsLoggingIn(false);
                });
            }
            firebaseSignIn();

            if (!user) {
                return;
            }

        } catch (error) {
            setError(String(error));
            setIsLoggingIn(false);
        }
    }

    useEffect(() => {
        if (userData && loginSuccess && user) {
            navigate("/");
            setIsLoggingIn(false);
            setLoginSuccess(false);
        }
    }, [loginSuccess, navigate, user, userData]);

    useEffect(() => {
        if (email) {
            setIsEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        }
    }, [email]);

    return (
        <main className="flex justify-center place-items-center min-h-screen sm:bg-gray-50">

            <form className="flex flex-col gap-4 bg-white rounded-lg py-16 px-8 sm:shadow-lg sm:w-[512px]" onSubmit={(e) => { e.preventDefault(); login(); }}>

                <h1 className="text-xl sm:text-2xl md:text-3xl text-center mb-4 text-gray-900 text-2xl sm:text-3xl md:text-4xl font-bold">Login</h1>

                <div className="flex flex-col gap-4 mb-4">
                    <label>
                        <span className="text-gray-600">Email:</span>
                        <Input extraClasses="mt-1" required placeholder={"Email Address"} type={"email"} value={email} onChange={(e) => (setEmail(e.target.value))} data-cy="emailInput"></Input>
                        {email && !isEmailValid &&
                            <div className="text-red-700" data-cy="invalidEmailMessage">Please enter a valid email address.</div>
                        }
                    </label>
                    <label>
                        <span className="text-gray-600">Password:</span>
                        <ShowPasswordContainer showPassword={showPassword} setShowPassword={setShowPassword}>
                            <Input required placeholder={"Password"} type={showPassword ? "text" : "password"} value={password} onChange={(e) => (setPassword(e.target.value))} data-cy="passwordInput"></Input>
                        </ShowPasswordContainer>
                    </label>
                </div>

                <Button type="submit" variant={"primary-solid"} data-cy="loginButton">
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isLoggingIn &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Login</div>
                    </div>
                </Button>

                <div className="text-gray-600 text-center">Or</div>

                <div className="mx-auto">
                    <SignInWithGoogleButton onClick={signInWithGoogle} text={"Sign in with Google"} />
                </div>

                {error &&
                    <p className="text-red-800" data-cy="errorMessage">{error}</p>
                }

                <div className="flex flex-col gap-2">
                    <p className="text-gray-600 mt-4">Don't have an account yet?
                        <Link className="text-gray-900 font-bold ml-2" to="/register">Register</Link>
                    </p>
                    <Link to="/forgot-password" className="text-gray-600" data-cy="forgotPasswordLink">Forgot password?</Link>
                </div>

            </form>
        </main>
    )
}