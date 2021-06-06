import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

const bucket = process.env.ATTACHMENTS_BUCKET
const s3Client = new AWS.S3({
    signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dietID = event.pathParameters.dietId
    try{
        const preSignedUrl = s3Client.getSignedUrl('putObject', {
            Bucket: bucket,
            Key: dietID,
            Expires:300
        })
        return({
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
              },
            body: JSON.stringify({
                "uploadUrl": preSignedUrl
            })
        })

    }catch(err){
        console.log('Error generating pre signed url : '+err)
        return ({
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
            },
            body: ''
        })
    }
}