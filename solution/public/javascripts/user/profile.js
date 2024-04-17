document.addEventListener('DOMContentLoaded', function () {
    $('#changePasswordForm').submit(async function (event) {
        const $newPassword = $('#newPassword');
        const $confirmPassword = $('#confirmPassword');
        const $password = $('#password');
        const $passwordError = $('#password_error');
        const $passwordErrorMessage = $('#password_error_message');

        $passwordError.addClass('d-none');
        $passwordErrorMessage.text('');

        $newPassword.removeClass('is-invalid');
        $confirmPassword.removeClass('is-invalid');

        $(this).removeClass('was-validated');

        const userId = $('#user_id').val();
        const oldPassword = $password.val();
        const newPassword = $newPassword.val();
        const confirmPassword = $confirmPassword.val();

        event.preventDefault();
        event.stopPropagation();

        //Check form validation (.checkValidity())
        if (!this.checkValidity()) {
            $(this).addClass('was-validated');
            event.stopPropagation();
            return;
        }

        //Check if new password and confirm password match
        if (newPassword !== confirmPassword || newPassword === '' || confirmPassword === '') {
            $newPassword.addClass('is-invalid');
            $confirmPassword.addClass('is-invalid');

            $(this).addClass('was-validated');
            event.stopPropagation();
            return;
        }

        //Send request to change password
        try {
            const response = await axios.post(`/${userId}/password`, {
                oldPassword,
                newPassword,
                confirmPassword
            });

            //Reload page
            location.reload();
        } catch (error) {
            console.error(error);
            $passwordErrorMessage.text(error.response.data.message);
            $passwordError.removeClass('d-none');

            //Clear password fields
            $password.val('');
            $newPassword.val('');
            $confirmPassword.val('');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {

    const email = document.getElementById('email');
    const username = document.getElementById('username');
    const last_name = document.getElementById('last_name');
    const first_name = document.getElementById('first_name');
    const user_id = document.getElementById('user_id');
    const success_message = document.getElementById('success_message');
    const error_message = document.getElementById('error_message');
    const updateProfileButton = document.getElementById('updateProfileButton');

    // Function to handle user action
    updateProfileButton.addEventListener("click", async () => {
        console.log('Button clicked'); // Check if the button click event is captured
        console.log(success_message); // Check if the success message element is selected
        success_message.classList.remove('d-none');
        try {
            const response = await axios.post("/updateProfile", {
                email: email.value,
                username: username.value,
                last_name:last_name.value,
                first_name:first_name.value,
                user_id :user_id.value
            });

            //If successfull
            location.reload();
        } catch (error) {
            //Error 400-500+
            error_message.classList.remove('d-none');
        }

    })
    })