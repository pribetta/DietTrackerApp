import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const dietTable = process.env.DIETITEMS_TABLE
const dietIndex = process.env.DIET_INDEX

const docClient:DocumentClient = new AWS.DynamoDB.DocumentClient()


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    const authHeader:string = event.headers['Authorization']
    const dietId:string = event.pathParameters.dietId
    console.log('Get diet items of the day');
    const words = authHeader.split(' ')
    const token = words[1]
    const userId = parseUserId(token)

    try{
        const data = await docClient.query({
            TableName: dietTable,
            IndexName: dietIndex,
            KeyConditionExpression: 'userId = :userId and dietId = :dietId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':dietId': dietId
            },
            ScanIndexForward: true
        }).promise()

        if(data.Count<1){
            throw new Error("no such diet item found")
        }
        const ret = JSON.stringify({
            item: data.Items[0]
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
        body: JSON.stringify({
            "Error": err
        })
        }
    }
}