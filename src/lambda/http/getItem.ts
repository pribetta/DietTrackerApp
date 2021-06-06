import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getDietItem } from '../../businessLogic/diet'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    try{
        const authHeader:string = event.headers['Authorization']
        const dietId:string = event.pathParameters.dietId
        console.log('Get diet items of the day');
        const words = authHeader.split(' ')
        const token = words[1]

        if((dietId==null)||(dietId==''))
            throw new Error('diet ID needed to process request')
        
        const data = await getDietItem(dietId,token)

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Credentials': true
              },
              body: data
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