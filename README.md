# COM6504-Assignment
Repository for the Intelligent Web Team Project

## Setup Guide
Setting up the application into a running state is easy to do and can be completed in a few steps.

If pulling from GitHub the project must be cloned from the git repository using the command:

git clone <repository.git url>.

Otherwise, extract the submission archive into a folder.

Once the project has been cloned or extracted, navigate into the top-level folder at the destination.

Inside this folder, there will be a folder titled solution. The web application is located within this folder. The file path should be <project root>/solution/. Navigate into this folder.

Next, you need to install the project dependencies. This can be carried out using Node Package Manager. Navigate using a command prompt to the above folder, and run the following command:

npm install

This will install all of the dependencies needed for the project.

The project is now ready to run. However, there is one step left before the application can be successfully started.

As this project makes use of an external database service, MongoDB Atlas; as well as handling user information such as passwords, there is are a number of different credentials, secrets, and configuration options that need to be configured.

This is made simple through the use of a dotenv file. An example of this file can be found at the path <project root>/www/.env.example. 
Normally, you will need to create a copy of this file named .env at the same location. 
However, for the purposes of marking, a version of the dotenv file is included that contains a pre-populated list of secrets so that you can connect to our existing database instance.
The demonstration environment file is called `.env.demo`. Please rename this to `.env` to connect correctly

Once you have created a version of the .env file, the application is now ready to run. In order to run the application, the following command can be executed:

npm run start

This will start up the application in your terminal and will allow you to access the site at the URL http://<BASE_URL>:<PORT>, which will default to http://localhost:3000, unless reconfigured within the dotenv file.

If done correctly, you should be presented with the Plant Identification landing page.

To login, you may create accounts as stated in the user guide, however, some demonstrator accounts have been provided if using the demonstration environment:

A Standard User:
```
Username: user@test.com
Password: password
```

An Admin Account:
```
Username: admin@test.com
Password: password
```

## User Guide
Upon navigating to the website, you will be presented with the landing page. This is a welcome page to introduce people to the website. Before being able to navigate past this point, an account is required.
To log in, press the 'Login/Register' button on the navigation bar.

### Registration and Login
In order to use the application, you must have a user account. To register, you must fill out the registration form, providing the required information. Once you have successfully registered, you can log in
using your username and password on the Login page.

### The Feed
Once logged in, you will be presented with the feed page. This is a list of all of the plants that are currently listed in the system. On this page, it is possible to order the posts by Most Recent, Oldest, or by Distance Away.
Please note that if sorting by distance away, you will need to have location services enabled. If you do not, you will be forced back into a regular sorting option.

To view more information about a plant, click on the 'see more' button on the plant card. This will take you to the plant page, where details can be seen.

### Plant Details Page
On the plant details page, you will be presented with more information about the plant. This includes the title and description of the post, along with images, a location map, and a comment section.
Additionally, extra details are provided about the plant's characteristics, such as its height, spread, and flower colour.

If you recognise the plant, you can suggest an identification by clicking the 'Suggest Identification' button. Open the identification modal, where you can
enter the name of the plant you believe it to be. Once submitted, the plant will be updated with your suggestion.
On this page, there will also be a list of other suggestions that have been made by other users.
You can upvote or downvote these suggestions to help the poster identify the plant.

If you are the poster of the plant, you can mark a suggestion as correct by clicking the 'Mark as Correct' button. This will update the plant with the correct identification
and will retrieve information about the plant from the internet.

You can leave comments on the plant by typing in the comment box and pressing the 'Add' button. You can also reply to users' comments by pressing the 'Reply' button on their comment.
You can like comments too. This system is in place to allow users to discuss the plant and its identification.

### Create a Post
If you have a plant that you would like to identify, you can create a post by clicking the 'New Post' button on the navigation bar. This will take you to the create post page.

On this page, you can fill out the form with information about the plant. This includes the title, description, images, and location of the plant. Once you have filled out the form, you can submit the post by pressing the 'Submit' button.
If you have an idea of what the plant is, you can suggest an identification when creating the post. This will be the first suggestion on the plant.

Once posted, the plant will be visible on the feed page for other users to see and identify.

### Profile Page
If you wish to see more information about yourself, including your posts, you can navigate to the profile page by clicking the 'Profile' button on the navigation bar.

On the profile page, you will see your user information, including your username and email address. You will also see a list of your posts, which you can click on to view the plant details page.
You can update your details here, and also change your password if you wish.

### Administration
If you are an admin user, you will have access to the admin panel. This can be accessed by clicking the 'Admin' button on the navigation bar.

After pressing this button, you will be redirected to the Admin Dashboard. Here, you can see a series of buttons to different admin functions. These include:
- User Management: Here, you can see a list of all users in the system. You can click on a user to view their details, and you can also delete a user from the system.
- Plant Management: Here, you can see a list of all plants in the system. You can click on a plant to view its details, and you can also delete a plant from the system.

Navigating to one of these pages will allow you to manage the users and plants in the system. You will see a table of all users or plants, and you can click on a row to view more details about the user or plant.

When viewing a user, you will also be able to edit their role. Once you have selected a new role, press the 'Update Profile' button to update the user's role.

### Logout
To log out of the application, click the 'Logout' button on the navigation bar. This will log you out of the system and redirect you to the landing page.