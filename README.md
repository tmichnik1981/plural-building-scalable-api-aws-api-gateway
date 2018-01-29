# Building Scalable APIs with the AWS API Gateway

#### Granting User Access Permissions

##### Creating an Access Policy for ACME Shoes

1. Create a user account for dev. who will create api gateway solutions.

   - Go to **Services** / **IAM**
   - Choose **Users**
   - Click **Add User** 
   - User name: "johnny.droptable"
   - Console password: "j0hnyp@33WOrd"
   - Click **Next**
   - Click **Create group**
   - Group name: "acmeshoes-dev"
   - Click **Create group**
   - Select created group add user: johnny.droptable  to this group
   - Click **Create user**

2. Create a policy

   - Go to **Services** / **IAM**

   - Choose **Policies**

   - Click **Create policy**

   - Select tab **JSON**

     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                         "apigateway:GET"
                     ],
                 "Resource": [
                     "*"
                     ]
             },
             {
                 "Effect": "Allow",
                 "Action": [
                         "apigateway:*"
                     ],
                 "Resource": [
                     "arn:aws:apigateway:eu-west-1::/restapis/*/stages/dev"
                     ]
             }
             ]
     }
     ```

   - Click **Review policy**

   - Name: "acmeshoes-devpolicy"

   - Descriptipion: "Policy for developers working on ACME Shoes"

   - Click **Create policy**

   - Find **acmeshoes-devpolicy** on a list and select.

   - **Policy actions** / **attach**

   - Find and select  **acmeshoes-dev** group and click **Attach**

   - Try to login https://235502691856.signin.aws.amazon.com/console

#### Using Lambda as a Backend Service 

##### Creating HelloWorld Lambda

1. Go to **Functions**

2. Click Create function

   - Name: HelloWorld
   - Runtime: Node.js 6.10
   - Description: "simple Hello World function"
   - Role: **lambda_basic_execution**

   ```javascript
   exports.handler = (event, context) => {
       var input1 = (event.input1 === undefined ? 'Hello' : event.input1);
       var input2 = (event.input2 === undefined ? 'World' : event.input2);
       
       var response = input1 + ' ' + input2;
       /**
        * 
        * context.succeed() - all functions and callback finished successfully
        * context.fail() - some function and callback failed
        * context.done() - both
        * 
       */
       context.done(null, {"response":response});
   };
   ```

3. Create 2 tests

   - with empty event `{ }`
   - with `{"input1": "Hi", "input2":"EPAM"}`

##### Building the getInventory Function

1. Create a directory **getInventory**

2. Go to the directory

   ```shell
   # project initialization
   npm init
   # installs node modules and saves them as dependencies
   npm install faker --save
   ```

3. Create index.js file.

4. Implement the lambda (code available: \getInventory\index.js)

5. Archive the code and dependencies `zip -r inventory index.js node_modules`

6. Go to aws.amazon.com / services / lambda.

7. Create function

   - Name: "getInventory"
   - Description: "returns 10 inventory items in an array"
   - Function code / Code entry type / Upload a .ZIP file
   - Click **Save**

#### Building the /Shoes Resource

##### Creating the /Shoes Resource 

1. Go to aws.amazon.com / Services / API Gateway

2. Select **New API**

   - API name: "ACME Shoes"
   - Description: "API for ACME Shoes backend"
   - Click **Create API**

3. ACME Shoes / Resources

   - Actions / Create Resource
   - Resource Name: "Shoes"
   - Click **Create Resource**
   - Select **/shoes** in the resource tree  and click action **Create Method**
   - Integration type: **Lambda Function**
   - Lambda Region: **eu-west-1**
   - Lambda Function: "getInventory"

   ###### Enabling CORS 

   - CORS - cross origin resource sharing

   1. Select **GET** under **/shoes**

   2. Click **Method Response** pane

      - expand 200 status

      - add headers

        ```
        Access-Control-Allow-Headers
        Access-Control-Allow-Methods
        Access-Control-Allow-Origin
        ```

   3. Click **Integration Response** pane

      - expand 200 status

      - Add Header Mappings

        ```
        Access-Control-Allow-Headers	'Content-Type,X-amz-Date,Authorization'
        Access-Control-Allow-Methods	'GET,POST'
        Access-Control-Allow-Origin		'*'
        ```

#### Building the Order Resource

##### Creating getOrderStatus function

1. Copy previously created code to a new **acme** directory.
2. Create getOrderStatus.js file.
3. Implement a new lambda function. Code is available: \acme\\getOrderStatus.js.
4. Archive everything in **acme** directory `zip -r acme *`.

###### Uploading to S3 bucket

1. Go to  aws.amazon.com / Services / S3
2. Click **Create bucket** 
   - Bucket name: "willbutton-acmeshoes:
   - Region: EU (Ireland)
   - Create
3. Select created bucket
4. Click **Upload**
5. Select acme.zip and upload

###### Create a lambda function

1. aws.amazon.com / Services / lambda
2. Create function
   - Name: "getOrderStatus"
   - Handler: "getOrderStatus.handler" 
   - Function code / Code entry type / Upload a file from Amazon S3
   - In S3 bucket find and select acme.zip and copy a link from **Overview**

##### Creating /Order Api

1. Go to aws.amazon.com / Services / API Gateway / ACME Shoes api
2. Select root / 
3. Actions /  Create resource.
   - Resource name: Order
   - Create
4. Select /order
5. Actions / Create method
   - Select **POST** and confirm.
   - Integration type: **Lambda Function**
   - Lambda Region: **eu-west-1**
   - Lambda Function: "getOrderStatus"
   - Save
   - Test with object `{"orderId":"ab12345"}`

##### Adding URL parameters

- Template Variables:
  - $context - all the contextual info of your api: apiId, indentity.accountOwner,  identity.sourceIp, identity.userAgent
  - $input - the input payload and parameters to be processed by templates:` json(x)` , `params()`, `path(x)`.
  - $util - utility functions for use in mapping templates: `escapeJavaStript()`, urlEncode(), urlDecode(), base64Encode(), base64Decode()

1. Go to aws.amazon.com / Services / API Gateway / ACME Shoes api

2. Select /order

3. Actions / Create Resource

   - Resource Name: "id"
   - Resource Path: "{id}"
   - Click **Create Resource**

4. Select /{id} and Actions / Create Method

   - Select **GET** and confirm
   - Integration type: **Lambda Function**
   - Lambda Region: **eu-west-1**
   - Lambda Function: "getOrderStatus"
   - Click **Save**

5. Select **Integration Request**

6. Body Mapping Templates / Add mapping templates

   - Content-Type: application/json

   - Scroll down and provide the template for extractinh id param

     ```json
     {"orderId": "$input.params('id')"}
     ```

   - Save


#### Deploying the API Gateway

- Cache settings - caching API results for better performance
- CloudWatch settings - access to logs, logging full RQ/RS, metrics - perf dashboard
- Throttling Settings - limits req/sec throught the gateway, rate - steady rate, burst limit - temporary
- Client Certificate - securing traffic, upload your own ssl certificate

##### Deployment

1. Go to aws.amazon.com / Services / API Gateway / ACME Shoes api
2. Choose **/**
3. **Actions** / **Deploy API**
   - Deployment stage: **[New Stage]** 
   - Stage name: "stage"
   - Stage description: "Staging  Environment"
   - Deployment description: "Initial deployment"
   - Click **Deploy**
4. Stage Editor
   - Settings
     - Enable throttling: Yes
     - Rate: 200
     - Burst: 500
   - Logs
     - Enable CloudWatch Logs: Yes
     - Log level: INFO
     - Log full requests/responses data: Yes
     - Enable Detailed CloudWatch Metrics: Yes
   - Click Save

##### Testing with Postman and Curl

###### Postman

1. Open Postman

2. Create GET request and past Invoke URL to stage api and shoes resource

   -  **https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/shoes**

3. Create POST request for orders resource

   - **https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/order**

   - Raw body

     ```json
     {"orderId":"1234"}
     ```

4. Create GET request for order status

   - **https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/order/ab7890**

###### Curl

1. Retrieve shoes 

   ```shell
   curl https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/shoes
   ```

2. Post new order

   ```
   curl -XPOST https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/order -d '{"orderId": "ab8383"}'
   ```

3. Get order status

   ```
   curl https://a4mryuru7i.execute-api.eu-west-1.amazonaws.com/stage/order/ab8383
   ```

#### Creating an API Key

- Purpose of an API Key
  - Monitoring and usage of API
  - Visible in CloudWatch logs
  - Enabled per method level
  - Should not be user for authorization

##### Creating and enabling an API Key

1. Go to aws.amazon.com / Services / API Gateway

2. Choose **API Keys**

3. Actions / Create API Key

   - Name: "ACMEKey"
   - API key:  **Auto Generate**
   - Description: "for ACME Shoes"

4. In the left select Usage Plans

   - Click **Create**
   - Name: "ACMEUsagePlan"
   - Rate: 100
   - Burst: 300
   - Add API Stage
   - API: ACME Shoes
   - Stage: stage
   - Select **API Key** Tab
   - Click Ass API Key to Usage Plan and fing ACMEKey

5. Find ACME Shoes  resource in the menu on the left

6. Click method POST under /order resource

   - Click **Method Request**
   - Change **API Key Required** to true

7. Repeat the same for GET

8. Click on **ACME Shoes API**

9. **Actions** / **Deploy API**

10. Select **stage** and deploy

11. In order  to invoke methods with API Key enabled, a header x-api-key must be added to the requests

    ```shell
    x-api-key: tsQuALvm0XtUuogRVeCvsHBZ10tRJn6m8BhEvn00
    ```

##### Creating the IAM Role for CloudWatch Logs

1. Go to aws.amazon.com / Services / IAM

2. Select **Policies**

3. Create a policy

   - Name: APIGatewayLogs

   - Description: logging for API Gateway

     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Action": [
                     "logs:*"
                 ],
                 "Resource": [
                     "arn:aws:logs:*:*:*"
                 ]
             }
         ]
     }
     ```

4. Select Roles

5. Create role

   - Name: "APIGTwy"
   - Attach previously created policy

6. Copy role's ARN

7. Go to Services / API Gateway

   - Paste ARN to **CloudWatch log role ARN**

#### Logging and Alerting

- Set on a per-stage level
  - Can be overridden per method
  - Info or Error level
  - Log full requests/responses
- View in LoudWatch Console
- Naming format
  - "API-Gateway-Execution-Logs"
  - API Id
  - Stage name
- Case-sensitive

##### Creating a custom Dashboard

1. Go to  aws.amazon.com / Services / CloudWatch
2. Select Metrics
3. Choose ApiGateway
   - By Method
   - Select Metric Name for Stage=stage and ApiName=ACME Shoes 
   - Click Add to Dashboard
   - Create new Dashboard
   - Name: ACME
   - Save
   - You can add other metrics onto the dashboard clicking Add widgets

##### Creating Alarms

- Create based on metric and threshold
- Can trigger notifications
- Flexible periods and statistics
- Uses SNS topics for notifications

1. Go to  aws.amazon.com / Services / CloudWatch
2. Selects **Alarms**
3. Create Alarm
   - By Method
   - Metric Name: Latency, Method: GET, Resource: shoes
   - Name: High Latency
   - Description: ACME Shoes
   - Whenever Latency is>=2
   - Scroll down to **Actions**
   - Whenever this alarm: State is ALARM
   - Send notification to: ACMEAlerts
   - Email list: foo@address.com

#### Publishing to production

1. Go to aws.amazon.com / Services / API Gateway / APIs / ACME Shoes
2. Select **Stages**
3. Click **stage**
4. Click **Create**
   - Stage name: "v1"
   - Stage description: "Initial production release"
   - Deployment: select the newest deploy
   - Click **Create**

