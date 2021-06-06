import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createDietRequest } from '../../requests/createDietRequest'

import { DietItem } from '../../models/DietItem'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'

const bucketName = process.env.ATTACHMENTS_BUCKET
const dietTable = process.env.DIETITEMS_TABLE

const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newDietItem: createDietRequest = JSON.parse(event.body)
    console.log("Create Diet request recieved: ", newDietItem);

    const authHeader:string = event.headers['Authorization']
    const words = authHeader.split(' ')
    const token = words[1]

    try{
        if((newDietItem.items=='')||(newDietItem.calories=='')){
            throw new Error("Items cannot be empty");     
        }
        const userId = parseUserId(token)
        const dietId = uuid.v4()

        const item: DietItem = {
            userId: userId,
            dietId: dietId,
            createdAt: new Date().toISOString(),
            items: newDietItem.items,
            calories: parseInt(newDietItem.calories,10),
            day: new Date().toISOString().slice(0,10),
            attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${dietId}`
        }
        console.log(JSON.stringify({
            item:item
        }));

        await docClient.put({
            TableName: dietTable,
            Item: item
        }).promise()
        console.log("Successfully created an item in the diet items table in dynamo db")
       
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(item)
        }

    }catch(err){
        console.log(err);
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