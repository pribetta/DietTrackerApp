# Diet Tracker Application using microservices for Udacity Cloud Developer Nanodegree Capstone Project

This is a simple application that helps you track the food that you have consumed for the day and count the total amount of calories consumed for a day.

This project consists only of the backend framework required to achieve the required functionality.

# Create your own environment

1) Open serverless.yml in a code editor, change environment variable values (DIETITEMS_TABLE, ATTACHMENTS_BUCKET, DIET_INDEX) under "environment" label to names that you would like your own resources to have.

2) Install AWS CLI and configure it to a user's account where the app will be deployed.

3) Install serverless using npm install -g serverless

4) Run npm install in the main folder.

5) Install the plugins: "serverless-webpack" and "serverless-iam-roles-per-function" by using npm install

6) Run "serverless deploy -v"

# Functionality

This app tracks all the food one has consumed in a day and keeps track of the total amount of calories consumed for that particular day.
A user can only view his own entries by logging in first(provide auth0 token) and cannot view anyone else's entries.
You can only see all the items entered TODAY only.
You can only update an item that was entered earlier in teh day and not any previous days' entries.
To view the user's previous days' entries, send a GET request with the appropriate Diet ID.
You can also attach pictures/files with every entry.

# Test the application

Load DietTracker.postman_collection.json into Postman app.
Use the endpoints returned by serverless.
Change the API endpoint variable to the appropriate one in the Postman script.
Enter the auth token in Bearer token field.

1) Create Diet Item
Create a few items by specifying the type of food in the "items" field and the amount of calories that it is worth in the "calories" field.

2) Get All Items
Verify all the items you have created by sending a Get request. It also shows the total amount of calories consumed in the day so far.

3) Get Single Item
To view details of a single item you have created, send a get request by sepcifying the ID of the item in the path.

4) Get attachment url
To upload an attachment with every item, send a Get attachment request.
Copy the presigned url that is returned by this request.
Send a PUT request to this url with the attachment attached in the body.

5) Delete item
Send a delete request with Diet ID mentioned in the path.


Endpoints for already deployed application:

Get All Items of the day: GET https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet

Get a Single Item: GET https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet/{dietId}

Create a new Item: POST https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet

Update an existing item: PATCH https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet/{dietId}

Delete an existing Item: DELETE https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet/{dietId}

Create an attachment URL: POST https://1zqbfaumqk.execute-api.ap-south-1.amazonaws.com/dev/diet/{dietId}/attachment

