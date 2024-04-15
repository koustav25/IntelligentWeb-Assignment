document.addEventListener('DOMContentLoaded', function () {
    $('#userDetailsForm').submit(async function (event) {
        const $first_name = $('#first_name');
        const $last_name = $('#last_name');
        const $email = $('#email');
        const $username = $('#username');
        const $role = $('#role');

        const $error = $('#update_error');
        const $errorMessage = $('#update_error_message');

        $error.addClass('d-none');
        $errorMessage.text('');

        $first_name.removeClass('is-invalid');
        $last_name.removeClass('is-invalid');
        $email.removeClass('is-invalid');
        $username.removeClass('is-invalid');
        $role.removeClass('is-invalid');

        $(this).removeClass('was-validated');

        event.preventDefault();
        event.stopPropagation();

        const userId = $('#user_id').val();
        const first_name = $first_name.val();
        const last_name = $last_name.val();
        const email = $email.val();
        const username = $username.val();
        const role = $role.val();

        //Check form validation (.checkValidity())
        if (!this.checkValidity()) {
            $(this).addClass('was-validated');
            event.stopPropagation();
            return;
        }

        //Send request to update user
        try {
            const response = await axios.post(`/admin/users/${userId}/update`, {
                first_name,
                last_name,
                email,
                username,
                role
            });

            //Reload page
            location.reload();
        } catch (error) {
            console.error(error);
            $errorMessage.text(error.response.data.message);
            $error.removeClass('d-none');
        }
    });
});