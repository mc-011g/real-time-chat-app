import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { fetchProfileInformation } from "../services/fetchProfileInformation";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { checkIfTokenExpired } from "../services/jwtUtils";
import CustomToast from "./CustomToast";
import logger from "../services/logger.js";
import { validate } from "../services/inputValidation.js";

const Profile = () => {

    const [confirmPassword, setConfirmPassword] = useState("")
    const [currentPassword, setCurrentPassword] = useState("");
    const [saveButtonToggle, setSaveButtonToggle] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        profilePictureURL: '',
        id: ''
    });

    const [currentPasswordVisibilityToggle, setCurrentPasswordVisiblityToggle] = useState(false);
    const [passwordVisibilityToggle, setPasswordVisiblityToggle] = useState(false);
    const [confirmPasswordVisibilityToggle, setConfirmPasswordVisiblityToggle] = useState(false);

    // To separate form data from the profile header name
    const [profileName, setProfileName] = useState({ firstName: "", lastName: "" });
    const [errors, setErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showPasswordInputs, setShowPasswordInputs] = useState(false);

    const validateInput = (event) => {
        const validationResult = validate(event);
        setErrors(prevErrors => ({ ...prevErrors, [validationResult.name]: validationResult.errorMessage }));
    }

    useEffect(() => {
        if (checkIfTokenExpired()) {
            navigate('/login');
        };
        getProfileInformation();
    }, [navigate]);

    const getProfileInformation = async () => {
        try {
            const profileInformation = await fetchProfileInformation();
            setProfileName({ firstName: profileInformation.firstName, lastName: profileInformation.lastName });
            setFormData({
                id: profileInformation.id,
                firstName: profileInformation.firstName,
                lastName: profileInformation.lastName,
                email: profileInformation.email,
                profilePictureURL: profileInformation.profilePictureURL,
                password: ""
            });
        } catch (error) {
            logger.debug(error);
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        validateInput(event);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axiosInstance.put('/api/users/saveUserProfile', { ...formData, currentPassword });
            handleShowToast('Saved profile');

            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                setProfileName({ firstName: formData.firstName, lastName: formData.lastName });
            } else {
                handleShowToast('Failed to save profile');
            }
        } catch (error) {
            if (error.response.data.password) {
                setErrors(prevErrors => ({ ...prevErrors, password: error.response.data.password }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, currentPassword: error.response.data }));
            }
        }
    }

    const handleChangePasswordInputs = () => {
        if (showPasswordInputs === false) {
            setShowPasswordInputs(true);
        } else {
            setShowPasswordInputs(false);
            setFormData(prevData => ({ ...prevData, password: "" }));
            setErrors(prevData => ({ ...prevData, confirmPassword: '' }));
            setConfirmPassword("");
        }
    }

    //For the password confirmation match
    useEffect(() => {
        if (formData.password !== "" || confirmPassword !== "") {
            if (formData.password !== confirmPassword) {
                setErrors(prevErrors => ({ ...prevErrors, confirmPassword: 'Passwords need to match' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, confirmPassword: '' }));
            }
        }

    }, [formData.password, confirmPassword]);

    const checkIfNoErrors = useCallback(() => {
        return (!errors.email && !errors.password && !errors.firstName && !errors.lastName && !errors.currentPassword && !errors.confirmPassword);
    }, [errors.confirmPassword, errors.currentPassword, errors.email, errors.firstName, errors.lastName, errors.password]);

    useEffect(() => {
        if (checkIfNoErrors()) {
            setSaveButtonToggle(true);
        } else if (!checkIfNoErrors()) {
            setSaveButtonToggle(false);
        }
    }, [formData, errors.confirmPassword, checkIfNoErrors, showPasswordInputs]);

    const handleShowToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    const navigateToDashboard = () => {
        navigate("/");
        window.location.reload(false);
    }

    return (
        <div className="container my-5">
            <Button variant="outline-primary" onClick={() => navigateToDashboard()}>
                Back to chat
            </Button>
            <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                <div className="d-flex align-items-center flex-column">
                    <div className="profilePicture profilePictureLarge mb-3">
                        {!formData.profilePictureURL && profileName.firstName.charAt(0) + profileName.lastName.charAt(0)}
                    </div>
                    <h3>{profileName.firstName} {profileName.lastName}</h3>
                </div>
                <label>
                    Upload profile picture
                    <input className="form-control" type="file" id="profilePicture" name="profilePicture" required={false} disabled={true} />
                </label>
                <div>
                    <label className="w-100">
                        Email
                        <input className="form-control" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required maxLength={64} />
                    </label>
                    {errors.email &&
                        <div className="text-danger">{errors.email}</div>
                    }
                </div>
                <div>
                    <label className="w-100">
                        First Name
                        <input className="form-control" type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required maxLength={20} />
                    </label>
                    {errors.firstName &&
                        <div className="text-danger">{errors.firstName}</div>
                    }
                </div>
                <div>
                    <label className="w-100">
                        Last Name
                        <input className="form-control" type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required maxLength={20} />
                    </label>
                    {errors.lastName &&
                        <div className="text-danger">{errors.lastName}</div>
                    }
                </div>
                <button type="button" className="btn btn-outline-primary mt-4" onClick={handleChangePasswordInputs}>
                    {!showPasswordInputs ? 'Change password' : 'Cancel'}
                </button>
                {showPasswordInputs &&
                    <>
                        <div>
                            <div className="w-100">
                                <label htmlFor="password">New Password</label>
                                <div className="passwordInput">
                                    <input className="form-control" type={`${passwordVisibilityToggle ? 'text' : 'password'}`} id="password" name="password" value={formData.password} onChange={handleChange} required={!showPasswordInputs ? false : true} maxLength={64} />
                                    <i className={`bi passwordVisiblityToggleButton ${passwordVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="passwordVisiblityToggle" onClick={() => setPasswordVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                                </div>
                            </div>
                            {errors.password &&
                                <div className="text-danger">{errors.password}</div>
                            }
                        </div>
                        <div>
                            <div className="w-100">
                                <label htmlFor="passwordConfirm">Confirm New Password</label>
                                <div className="passwordInput">
                                    <input className="form-control" type={`${confirmPasswordVisibilityToggle ? 'text' : 'password'}`} id="passwordConfirm" name="passwordConfirm" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); validateInput(event) }} required={!showPasswordInputs ? false : true} maxLength={64} />
                                    <i className={`bi passwordVisiblityToggleButton ${confirmPasswordVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="confirmPasswordVisiblityToggle" onClick={() => setConfirmPasswordVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                                </div>
                            </div>
                            {errors.confirmPassword &&
                                <div className="text-danger">{errors.confirmPassword}</div>
                            }
                        </div>
                    </>
                }
                <div>
                    <div className="mt-4 w-100">
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className="passwordInput">
                            <input className="form-control" type={`${currentPasswordVisibilityToggle ? 'text' : 'password'}`} id="currentPassword" name="currentPassword" value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); validateInput(event) }} required maxLength={64} />
                            <i className={`bi passwordVisiblityToggleButton ${currentPasswordVisibilityToggle ? 'bi-eye-slash' : 'bi-eye'}`} id="currentPasswordVisiblityToggle" onClick={() => setCurrentPasswordVisiblityToggle(prevVisibilty => (!prevVisibilty))}></i>
                        </div>
                    </div>
                    {errors.currentPassword &&
                        <div className="text-danger">{errors.currentPassword}</div>
                    }
                </div>
                <input type="hidden" value={formData.id} name="id" id="id" />
                <button type="submit" className="btn btn-primary" name="saveProfileButton" id="saveProfileButton" disabled={!saveButtonToggle}>Save</button>
            </form>

            <CustomToast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
        </div>
    );
};

export default Profile;

