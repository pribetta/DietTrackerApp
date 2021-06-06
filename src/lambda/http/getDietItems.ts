import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getAllDietItems } from '../../businessLogic/diet'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    try{
        const authHeader:string = event.headers['Authorization']
        console.log('Get diet items of the day');
        const words = authHeader.split(' ')
        const token = words[1]
        
        const ret = await getAllDietItems(token)

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
        body: err
        }
    }
}