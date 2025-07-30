import { useContext, useEffect, useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import ShowPasswordContainer from "../components/ShowPasswordContainer";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useSelector } from "react-redux";
import { getUser } from "../redux/selectors";
import { UserContext } from "../context/UserContext";

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

    const login = () => {
        setIsLoggingIn(true);
        
        try {
            const firebaseSignIn = async () => {
                await signInWithEmailAndPassword(getAuth(), email, password).then((userCredential) => {
                    const user = userCredential.user;

                    if (!user.emailVerified) {
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
        } 
    }

    useEffect(() => {
        if (userData && loginSuccess && user && user.emailVerified) {
            navigate("/");
            setIsLoggingIn(false);
            setLoginSuccess(false);
        }
    }, [loginSuccess, navigate, user, userData]);

    return (
        <div className="flex justify-center place-items-center h-[100vh] sm:bg-gray-50">

            <form className="flex flex-col gap-4 bg-white py-16 px-8 sm:shadow-lg" onSubmit={(e) => { e.preventDefault(); login(); }}>
                <h1 className="text-3xl text-center mb-4 text-gray-900">Login</h1>

                <label>
                    <span className="text-gray-600">Email</span>
                    <Input required placeholder={"Email Address"} type={"email"} value={email} onChange={(e) => (setEmail(e.target.value))}></Input>
                </label>

                <label>
                    <span className="text-gray-600">Password</span>
                    <ShowPasswordContainer showPassword={showPassword} setShowPassword={setShowPassword}>
                        <Input required placeholder={"Password"} type={showPassword ? "text" : "password"} value={password} onChange={(e) => (setPassword(e.target.value))} ></Input>
                    </ShowPasswordContainer>
                </label>

                <Button type="submit" variant={"primary-solid"} disabled={isLoggingIn}>
                    <div className="flex flex-row gap-2 align-middle justify-center place-items-center">
                        {isLoggingIn &&
                            <div className="border-blue-400 border-t-blue-50 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        }
                        <div>Login</div>
                    </div>
                </Button>

                {error &&
                    <p className="text-red-800">{error}</p>
                }

                <p className="text-gray-600 m-0">Don't have an account yet? <span className="text-gray-900 font-bold hover:cursor-pointer">
                    <Link to="/register">Register</Link>
                </span>
                </p>

                <Link to="/forgot-password" className="text-gray-600">Forgot password?</Link>
            </form>
        </div>
    )
}