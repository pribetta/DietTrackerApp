import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils';
import { bucketAccess } from '../dataLayer/bucketAccess';
import { dietAccess } from '../dataLayer/dietItemAccess';
import { DietItem } from '../models/DietItem';
import { DietItemUpdate } from '../models/DietItemUpdate';
import { createDietRequest } from '../requests/CreateDietRequest';

const dietAcc = new dietAccess()
const attachAccess = new bucketAccess()

export async function createDietItem(newDietItem:createDietRequest, token:string): Promise<DietItem> {
    const userId = parseUserId(token)
    const dietId = uuid.v4()
    const bucketName = attachAccess.getBucketName()

    const item: DietItem = {
        userId: userId,
        dietId: dietId,
        createdAt: new Date().toISOString(),
        items: newDietItem.items,
        calories: newDietItem.calories,
        day: new Date().toISOString().slice(0,10),
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${dietId}`
    }

    console.log(JSON.stringify({
        item: item
    }))

   const ret  = await dietAcc.createNewDiet(item)
   if(ret==false)
    throw new Error("Couldnt create new item")
   else
    return item
}

export async function getDietItem(dietId: string, token: string): Promise<string> {
    const userId = parseUserId(token)
    const dietItem:DietItem = await dietAcc.getDietItem(userId, dietId)

    if(dietItem==null)
        throw new Error("No such item found")

    return JSON.stringify({
        item: dietItem
    })
}

export async function getAllDietItems(token: string): Promise<string> {
    const userId = parseUserId(token)
    const today:string = new Date().toISOString().slice(0,10)
    const data = await dietAcc.getAllDietItemsByDay(userId,today)
    
    var cals:number = 0
    data.forEach( k => {
        cals += parseInt(k.calories,10)
    })
    
    
    return JSON.stringify({
        items: data,
        totalCalorieCount: cals
    })
}

export async function updateDietItem(token:string, dietId: string, updatedDiet: DietItemUpdate) : Promise<Boolean> {
    const userId:string = parseUserId(token)
    const res:DietItem = await dietAcc.findDietByID(userId,dietId)
    const todaysDate:string = new Date().toISOString().slice(0,10)
    if(todaysDate !== res.day){
        throw new Error('Only an item entered today can be altered')
    }
    console.log('Biz logic layer.. updating.. ', res)
    await dietAcc.updateDietByID(res,updatedDiet)
    return true
}

export async function deleteDietItem(token:string, dietId: string) {
    const userId = parseUserId(token)
    const item = await dietAcc.findDietByID(userId,dietId)
    console.log('Biz logic layer.. deleting..', item)
    await dietAcc.deleteDiet(item)
    await attachAccess.deleteItem(dietId)
}

export async function getuploadUrl(dietId: string) {
    return await attachAccess.getSignedUrl(dietId)
}