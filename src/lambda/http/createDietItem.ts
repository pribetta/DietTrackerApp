import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { createDietRequest } from '../../requests/createDietRequest'

import { createDietItem } from '../../businessLogic/diet'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {    

    try{
        const newDietItem: createDietRequest = JSON.parse(event.body)
        console.log("Create Diet request recieved: ", newDietItem);

        const authHeader:string = event.headers['Authorization']
        const words = authHeader.split(' ')
        const token = words[1]

        if((newDietItem.items=='')||(newDietItem.calories==null)){
            throw new Error("The fields Items and calories cannot be empty");     
        }
        const item = await createDietItem(newDietItem,token)
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