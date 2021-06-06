import { DietItem } from '../models/DietItem'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { DietItemUpdate } from '../models/DietItemUpdate';

const dietIndex = process.env.DIET_INDEX
const allItemsIndex = process.env.ALLITEMS_INDEX

export class dietAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly dietTable = process.env.DIETITEMS_TABLE
    ){

    }

    async createNewDiet(item: DietItem) : Promise<boolean> {
        try{
            await this.docClient.put({
              TableName: this.dietTable,
              Item: item
            }).promise()
            console.log("successfully created an item in Diet table in dynamo db")
            return true
        }catch(err){
            console.log(err)
            console.log('Couldnt create item in dynamo db')
            return false
        }
        
    }

    async getDietItem(userId: string, dietId: string): Promise<any> {
        const data = await this.docClient.query({
            TableName: this.dietTable,
            IndexName: dietIndex,
            KeyConditionExpression: 'userId = :userId and dietId = :dietId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':dietId': dietId
            },
            ScanIndexForward: true
        }).promise()
        if(data.Count<1)
            return null
        return ({
            userId: data.Items[0].userId,
            dietId: data.Items[0].dietId,
            createdAt: data.Items[0].createdAt,
            items: data.Items[0].items,
            calories: data.Items[0].calories,
            day: data.Items[0].day,
            attachmentUrl: data.Items[0].attachmentUrl
        })
    }

    async getAllDietItemsByDay(userId:string, toDay: string): Promise<Array<any>> {
        const data = await this.docClient.query({
            TableName: this.dietTable,
            IndexName: allItemsIndex,
            KeyConditionExpression: '#nm1 = :val1 and #nm2 = :val2',
            ExpressionAttributeNames: {
                '#nm1': "userId",
                "#nm2": "day"
            },
            ExpressionAttributeValues: {
                ':val1': userId,
                ':val2' : toDay
            },
            ScanIndexForward: true
        }).promise()
        
        var res = Array()
        data.Items.forEach(d=> {
            res.push({
                userId: d.userId,
                dietId: d.dietId,
                createdAt: d.createdAt,
                items: d.items,
                calories: d.calories,
                day: d.day,
                attachmentUrl: d.attachmentUrl
            })
        })
        return res
    }

    async findDietByID(userId:string, dietId: string): Promise<DietItem> {

        const res = await this.docClient.query({
            TableName: this.dietTable,
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
        
        if(res.Count<1)
          throw new Error('No such item found in Todo table')
          
        return {
            userId: res.Items[0].userId,
            dietId: res.Items[0].dietId,
            createdAt: res.Items[0].createdAt,
            items: res.Items[0].items,
            calories: res.Items[0].calories,
            day: res.Items[0].day,
            attachmentUrl: res.Items[0].attachmentUrl
        }
        
    }

    async updateDietByID(res: DietItem, updatedDietItem: DietItemUpdate): Promise<Boolean> {
        
        await this.docClient.update({
            TableName: this.dietTable,
            Key: {
                userId: res.userId,
                createdAt: res.createdAt
            },
            UpdateExpression: 'set #key1 = :val1, #key2 = :val2',
            ExpressionAttributeNames: {
                '#key1' : 'items',
                '#key2' : 'calories'
            },
            ExpressionAttributeValues : {
                ':val1' : updatedDietItem.items,
                ':val2' : updatedDietItem.calories
            },
            ReturnValues : "UPDATED_NEW" 
        }).promise()

        return true
    }

    async deleteDiet(item: DietItem) {
        console.log('Deleting ... ', item)
        return await this.docClient.delete({
            TableName: this.dietTable,
            Key: {
                "userId": item.userId,
                "createdAt": item.createdAt
            }
        }).promise()
    }
    
}