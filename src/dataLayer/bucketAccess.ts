import * as AWS from 'aws-sdk'

export class bucketAccess{
    constructor(
        private readonly bucket= process.env.ATTACHMENTS_BUCKET,
        private readonly s3Client= new AWS.S3({
            signatureVersion: 'v4'
          })
    ){}

    async deleteItem(dietId: string){
        return await this.s3Client.deleteObject({
            Bucket: this.bucket,
            Key: dietId
          }, (err,data)=> {
            if(err)
              console.log('couldnt delete from s3 bucket - ',err)
            else
              console.log('deleted successfully - ', data)
          }).promise()

    }

    async getSignedUrl(dietId: string): Promise<string> {
        
        return this.s3Client.getSignedUrl('putObject', {
            Bucket: this.bucket,
            Key: dietId,
            Expires: 300
          })
    }

    getBucketName() {
        return this.bucket
    }
}