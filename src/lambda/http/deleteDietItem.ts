import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { deleteDietItem } from '../../businessLogic/diet';



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
       
    try{
        const dietId: string = event.pathParameters.dietId
        const authHeader:string = event.headers['Authorization']
        const words = authHeader.split(' ')
        const token = words[1]

        if((dietId==null)||(dietId==''))
            throw new Error('diet ID needed to process request')

        await deleteDietItem(token,dietId)

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
