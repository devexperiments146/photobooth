

Enable service
configure api & Endpoint & export json file
Add user as test user Google Auth Platform > Audience > Utilisateurs test

Copy client secret file inside photobooth-backend folder
create .env file inside photobooth-backend folder

Configue .env variable with 

GOOGLE_CREDENTIALS_PATH - client secret file name
GOOGLE_SCOPES_API=https://www.googleapis.com/auth/drive
JWT_SECRET -random JWT secret
REDIRECT_TO_LOGIN=http://localhost:3000/camera
FOLDER_ID - folder ID inside the google drive
