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