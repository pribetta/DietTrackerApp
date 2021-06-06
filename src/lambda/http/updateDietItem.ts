import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { updateDietItem } from '../../businessLogic/diet'
import { DietItemUpdate } from '../../models/DietItemUpdate'

export const handler: APIGatewayProxyHandler = async(event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    
    try{
        const dietId = event.pathParameters.dietId
        const updatedDietItem: DietItemUpdate = JSON.parse(event.body)
        const authHeader:string = event.headers['Authorization']
        const words = authHeader.split(' ')
        const token = words[1]

        if((dietId==null)||(dietId==''))
            throw new Error('diet ID needed to process request')
        
        await updateDietItem(token, dietId, updatedDietItem)

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