import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getuploadUrl } from '../../businessLogic/diet'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dietId = event.pathParameters.dietId
    try{
        const preSignedUrl = await getuploadUrl(dietId)
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