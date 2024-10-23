import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useContext, useState } from "react";
import { RoomContext } from "../context/RoomContext";
import logger from "../services/logger.js";
import { validate } from "../services/inputValidation.js";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [passwordVisibilityToggle, setPasswordVisiblityToggle] = useState(false);
    const { getCurrentRoom } = useContext(RoomContext);
    const [errors, setErrors] = useState({});

    const validateInput = (event) => {
        const validationResult = validate(event);
        setErrors(prevErrors => ({ ...prevErrors, [validationResult.name]: validationResult.errorMessage }));
    }

    const loginUser = async () => {
        if (!errors.password && !errors.email) {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
                    {
                        email: email,
                        password: password
                    }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                );

                if (response.data.accessToken) {
                    localStorage.setItem('token', response.data.accessToken);
                } else {
                    logger.debug('Token not found in response')
                }

                getCurrentRoom(true);
                navigate('/');
            } catch (error) {
                logger.debug('Login failed', error);
                if (error.response.status === 400 || error.response.status === 500) {
                    setErrors(error.response.data);
                }
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser();
    }

    return (
        <div className="bg-light vh-100">
            <div className="loginContainer">
                <div className="bg-white loginForm py-5">

                    <div className="w-100">
                        <h1 className="text-center">Login</h1>
                        <form className="mt-3" onSubmit={handleSubmit}>
                            <div className="d-flex flex-column gap-3 px-5">
                                <div>
                                    <label className="w-100">
                                        Email
                                        <input type="email" className="form-control" id="email" name="email" onChange={(e) => { setEmail(e.target.value); validateInput(e) }} required />
                                    </label>
                                    {errors.email && <div className="text-danger">{errors.email}</div>}
                                </div>
                                <div>
                                    <div className="w-100">
                                        <label htmlFor="password">Password</label>
                                        <div className="passwordInput">
                                            <input type={`${passwordVisibilityToggle ? 'text' : 'password'}`} className="form-control" id="password" name="password" onChange={(e) => { setPassword(e.target.value); validateInput(e) }} required />
                                            <i className={`bi passwordVisiblityToggleButton ${passwordVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="passwordVisiblityToggle" onClick={() => setPasswordVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                                        </div>
                                    </div>
                                    {errors.error && <div className="text-danger">{errors.error}</div>}
                                    {errors.password && <div className="text-danger">{errors.password}</div>}
                                </div>
                                <button type="submit" className="btn btn-primary">Login</button>
                                <div className="text-center">
                                    <span>Don't have an account? </span>
                                    <Link to="/register">
                                        Register
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

export default Login;