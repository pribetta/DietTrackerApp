import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateDietRequest } from '../../requests/updateDietRequest'

import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { parseUserId } from '../../auth/utils'


const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
const dietTable = process.env.DIETITEMS_TABLE
const dietIndex = process.env.DIET_INDEX

export const handler: APIGatewayProxyHandler = async(event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dietId = event.pathParameters.dietId
    const updatedDietItem: updateDietRequest = JSON.parse(event.body)
    const authHeader:string = event.headers['Authorization']
    const words = authHeader.split(' ')
    const token = words[1]
    const userId = parseUserId(token)
    
    try{
        const res = await docClient.query({
            TableName: dietTable,
            IndexName: dietIndex,
            KeyConditionExpression: "#userId = :userId and #dietId = :dietId",
            ExpressionAttributeNames: {
                "#userId":"userId",
                "#dietId":"dietId"
            },
            ExpressionAttributeValues: {
                ":userId": userId,
                ":dietId": dietId                
            },
            ScanIndexForward: true
        }).promise()

        if(res.Count<1){
            throw new Error("No such record found")
        }

        const todaysDate:string = new Date().toISOString().slice(0,10)

        if(todaysDate !== res.Items[0].day){
            throw new Error('Only an item entered today can be altered')
        }

        await docClient.update({
            TableName: dietTable,
            Key: {
                userId: res.Items[0].userId,
                createdAt: res.Items[0].createdAt
            },
            UpdateExpression: 'set #key1 = :val1, #key2 = :val2',
            ExpressionAttributeNames: {
                '#key1' : 'items',
                '#key2' : 'calories'
            },
            ExpressionAttributeValues : {
                ':val1' : updatedDietItem.items,
                ':val2' : parseInt(updatedDietItem.calories,10)
            },
            ReturnValues : "UPDATED_NEW" 
        }).promise()

        return {
            statusCode: 201,
            headers: {
              "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Origin':'*',
              'Access-Control-Allow-Credentials': true
            },
            body: ''
          }
      

    }catch(err){
        console.log('update failed ', err)
        return {
        statusCode: 404,
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