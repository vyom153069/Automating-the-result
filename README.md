# Automating-the-result
  This is an automated web scraper written in node, using puppeteer.This will give you a pdf of your result
  <br>
  
  Note : <br>
  1.This is for IPU Students and which are enrolled in BTECH BCA BBA courses.<br>
  <p>2.Before sending your email using gmail you have to allow non secure apps to access gmail you can do this by going to your gmail settings [https://myaccount.google.com/lesssecureapps?pli=1]<br><p>
  3.Also enable the captcha [https://accounts.google.com/DisplayUnlockCaptcha]

## Command
 
   * Open a terminal in the activity folder and run the following command:
   * make sure you edited credentials file (otherwise you will get error)

  ```node
  node myresult "credentials.json"
  
  ```
.
## Features

* Logs into the user's account, searches results.
  
* gives combined pdf with results.
  
* email the result.

* convert it to html.
  
* Gives overall result.
  

## Use

* Clone the repository.

* Open the base directory of the repository.

* Run the following command in terminal:

  ```node
  npm install
  ```

* Create a credentials.JSON in the activity folder file with your details:
  
  ```json
    {
    "from" : "SENDERS_EMIAL",
    "pwd" : "SENDERS_PASSWORD" ,
    "to":"RECEIVER_EMAIL",
    "enroll":"YOUR_EMAIL",
    "branch":"YOUR_COURSE"
  }
  ```

