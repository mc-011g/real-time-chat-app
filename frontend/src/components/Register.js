import { Link } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";
import { validate } from "../services/inputValidation.js";

const Register = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [passwordVisibilityToggle, setPasswordVisiblityToggle] = useState(false);
    const [passwordConfirmVisibilityToggle, setPasswordConfirmVisiblityToggle] = useState(false);
    const [errors, setErrors] = useState({});

    const validateInput = (event) => {
        const validationResult = validate(event);
        setErrors(prevErrors => ({ ...prevErrors, [validationResult.name]: validationResult.errorMessage }));
    }

    //For checking if passwords match
    useEffect(() => {
        if ((password !== confirmPassword) && !errors.confirmPassword) {
            setErrors(prevErrors => ({ ...prevErrors, confirmPassword: 'Passwords must match' }));
        }
        if ((password === confirmPassword) && errors.confirmPassword) {
            setErrors(prevErrors => ({ ...prevErrors, confirmPassword: '' }));
        }
    }, [password, confirmPassword, errors.confirmPassword]);

    const registerUser = async (user) => {
        if (!errors.email && !errors.password && !errors.firstName && !errors.lastName && !errors.confirmPassword) {
            try {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/register`, user);
                window.location.href = "/login";
            } catch (error) {
                if (error.response.status === 500) {
                    const errors = error.response.data;
                    if (errors.error) {
                        setErrors({ registerError: errors.error });
                    }
                }
            }
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = { email, firstName, lastName, password };
        registerUser(user);
    }

    return (
        <div className="bg-light vh-100">
            <div className="registerContainer">
                <div className="bg-white registerForm py-5">
                    <div className="w-100">
                        <h1 className="text-center">Register</h1>
                        <form className="mt-3" onSubmit={handleSubmit}>
                            <div className="d-flex flex-column gap-3 px-5">
                                <div>
                                    <label className="w-100">
                                        Email
                                        <input type="email" className="form-control" id="email" name="email" onChange={(e) => { setEmail(e.target.value); validateInput(e) }} maxLength={64}
                                            required
                                        />
                                    </label>
                                    {errors.email && <div className="text-danger">{errors.email}</div>}
                                </div>
                                <div>
                                    <label className="w-100">
                                        First Name
                                        <input type="text" className="form-control" id="firstName" name="firstName" onChange={(e) => { setFirstName(e.target.value); validateInput(e) }} maxLength={20}
                                            required
                                        />
                                    </label>
                                    {errors.firstName && <div className="text-danger">{errors.firstName}</div>}
                                </div>
                                <div>
                                    <label className="w-100">
                                        Last Name
                                        <input type="text" className="form-control" id="lastName" name="lastName" onChange={(e) => { setLastName(e.target.value); validateInput(e) }} maxLength={20}
                                            required
                                        />
                                    </label>
                                    {errors.lastName && <div className="text-danger">{errors.lastName}</div>}
                                </div>
                                <div>
                                    <label className="w-100">
                                        Password
                                        <div className="passwordInput">
                                            <input type={`${passwordVisibilityToggle ? 'text' : 'password'}`} className="form-control" id="password" name="password" onChange={(e) => { setPassword(e.target.value); validateInput(e) }} required maxLength={64} />
                                            <i className={`bi passwordVisiblityToggleButton ${passwordVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="passwordVisiblityToggle" onClick={() => setPasswordVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                                        </div>
                                    </label>
                                    {errors.password && <div className="text-danger">{errors.password}</div>}
                                </div>
                                <div>
                                    <label className="w-100">
                                        Confirm Password
                                        <div className="passwordInput">
                                            <input type={`${passwordConfirmVisibilityToggle ? 'text' : 'password'}`} className="form-control" id="confirmPassword" name="confirmPassword" onChange={(e) => setConfirmPassword(e.target.value)} required maxLength={64} />
                                            <i className={`bi passwordVisiblityToggleButton ${passwordConfirmVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="passwordConfirmVisiblityToggle" onClick={() => setPasswordConfirmVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                                        </div>
                                    </label>
                                    {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                                </div>
                                <button type="submit" className="btn btn-primary me-3 w-100">Register</button>
                                {errors.registerError && <div className="text-danger">{errors.registerError}</div>}
                                <div className="text-center">
                                    <span>Have an account? </span>
                                    <Link to="/login" >
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;