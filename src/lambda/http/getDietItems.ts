import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const dietTable = process.env.DIETITEMS_TABLE
const docClient:DocumentClient = new AWS.DynamoDB.DocumentClient()


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    const authHeader:string = event.headers['Authorization']
    console.log('Get diet items of the day');
    const words = authHeader.split(' ')
    const token = words[1]
    const userId = parseUserId(token)

    try{
        const data = await docClient.query({
            TableName: dietTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: true
        }).promise()
        var calorieCount = 0
        data.Items.forEach((rec) => {
            calorieCount+=rec.calories
        })
        const ret = JSON.stringify({
            items: data.Items,
            TotalCalorieCount: calorieCount
        });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
              },
              body: ret
        }

    }catch(err){
        console.log(err)

        return {
        statusCode: 400,
        headers: {
            "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials': true
        },
        body: 'Error retrieving to do items'
        }
    }
}