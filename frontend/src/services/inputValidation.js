//Handles all the validation from all forms
export const validate = (event) => {
    let errorMessage = '';
    const { name, value } = event.target;

    if (name === 'roomName') {
        if (!value) {
            errorMessage = 'Room name is required';
        }
        else if (value.length > 64) {
            errorMessage = 'Room name needs to be 1 to 64 characters long';
        }
    }

    if (name === 'email') {
        if (!value) {
            errorMessage = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
            errorMessage = 'Email address is invalid';
        } else if (value.length > 64) {
            errorMessage = 'Email needs to be less than 64 characters in length';
        }
    }

    if (name === 'password') {
        if (!value) {
            errorMessage = 'Password is required';
        }
        if (value.length < 8 || value.length > 64) {
            errorMessage = 'Password needs to be 8 to 64 characters long';
        }
    }

    if (name === 'firstName') {
        if (!value) {
            errorMessage = 'First name is required';
        }
        else if (value.length < 2 || value.length > 20) {
            errorMessage = 'First name needs to be 2 to 20 characters long';
        }
    }

    if (name === 'lastName') {
        if (!value) {
            errorMessage = 'Last name is required';
        }
        else if (value.length < 2 || value.length > 20) {
            errorMessage = 'Last name needs to be 2 to 20 characters long';
        }
    }

    if (name === 'message') {
        if (!value) {
            errorMessage = 'Message is required';
        } else if (value.length > 5000) {
            errorMessage = 'Message not be over 5000 characters in length';
        }
    }

    if (name === 'currentPassword') {
        if (!value) {
            errorMessage = 'Current password is required';
        }
        else if (value.length > 64) {
            errorMessage = 'Current password needs to be less than 64 characters long';
        }
    }

    return { name: name, errorMessage: errorMessage };
}

