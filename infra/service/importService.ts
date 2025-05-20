import {S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as Papa from 'papaparse';

const s3Client = new S3Client({});

export async function importProductFile(event: any) {
    console.log(`Received event: ${JSON.stringify(event)}`);
    const filename = event.filename;

    console.log("Creating path in S3")

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded/${filename}`,
    })

    try {
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
    catch (e) {
        console.log(e)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating object' }),
        };
    }
}

export async function parseProductFile(event: any) {
    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {
        const { Body } = await s3Client.send(new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        if (!Body) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'No content' }),
            };
        }
        const stringContent = await Body.transformToString()
        const parsedContent = Papa.parse(stringContent, {
            header: true,
        })
        parsedContent.data.forEach((product: any) => {
            const parsedProduct: Product = {
                title: product.title,
                description: product.description,
                price: product.price,
            }
            console.log('Parsed Product:', parsedProduct);
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File processed successfully' }),
        };
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
}