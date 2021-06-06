import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { DocumentClient} from 'aws-sdk/clients/dynamodb'
import { parseUserId } from '../../auth/utils';

const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient();

const dietTable= process.env.DIETITEMS_TABLE
const dietIndex = process.env.DIET_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dietId: string = event.pathParameters.dietId
    const authHeader:string = event.headers['Authorization']
    const words = authHeader.split(' ')
    const token = words[1]
    const userId = parseUserId(token)
    
    try{
        const res = await docClient.query({
            TableName: dietTable,
            IndexName: dietIndex,
            KeyConditionExpression: 'userId = :userId and dietId = :dietId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':dietId': dietId                
            },
            ScanIndexForward: true
        }).promise()

        if(res.Count<1)
            throw new Error('No such item found in Diet Items table');
        
        await docClient.delete({
            TableName: dietTable,
            Key: {
                userId: res.Items[0].userId,
                createdAt: res.Items[0].createdAt
            }
        }).promise()

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
              },
              body: ''
        }
    }catch(err){
        console.log('Unable to delete item - ', err)
        return {
        statusCode: 404,
        headers: {
            "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials': true
        },
        body: err
        }
    }
}
