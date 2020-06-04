# Automating-the-result
  This is an automated web scraper written in node, using puppeteer.This will give you a pdf of your result 

## Features

* [x] Logs into the user's account, searches results.
  
* [x] gives combined pdf with results.
  
* [ ] email the result.

* [ ] convert it to html.
  
* [ ] Gives overall result.
  

## Usage

* Clone the repository.

* Open the base directory of the repository.

* Run the following command in terminal:

  ```node
  npm install
  ```

* Create a credentials.JSON in the activity folder file with your IMDb account email and password as follows:
  
  ```json
    {
        "senderEmail": "YOUR_EMAIL_ID_HERE",
        "pwd": "YOUR_PASSWORD_HERE",
    }
  ```

  Note: sender email should have valid email id, otherwise you'll have to make changes in the code.

* Open a terminal in the activity folder and run the following command:

  ```node
  node myresult "YOUR_ROLL_NUMBER" "YOUR_BRANCH" "credentials.json"
  
  ```
