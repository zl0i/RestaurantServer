import express from 'express'
import fileUpload from 'express-fileupload';
import * as Minio from 'minio'

var minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env['STORAGE_USER'],
    secretKey: process.env['STORAGE_PASSWORD']
});

minioClient.bucketExists('restaurant', (err, res) => {
    if (res == false) {
        minioClient.makeBucket('restaurant', '')
            .then((val) => {
                console.log(val)
            })
            .catch((err) => {
                console.log(err)
            })
    } else {
        console.log('[OK] Storage is connected')
    }
})

export default class ObjectStorage {

    static listImages(req: express.Request, res: express.Response) {        
        const stream = minioClient.listObjects('restaurant', '', true)
        res.setHeader('Content-Type', 'application/json')
        res.write('[')
        stream.on('data', (obj) => {
            res.write(JSON.stringify(obj))
            res.write(',')
        })
        stream.on('end', () => {
            res.write(']')
            res.end()
        })
        stream.on('error', (e) => {
            res.status(500).end()
        })
    }

    static streamImage(req: express.Request, res: express.Response) {
        minioClient.getObject('restaurant', req.params.file, function (err, dataStream) {
            if (err) {
                console.log(err)
                return res.status(404).end()
            }
            dataStream.on('data', function (chunk) {
                res.write(chunk)
            })
            dataStream.on('end', function () {
                res.end()
            })
            dataStream.on('error', function (err) {
                console.log(err)
                res.status(500).end()
            })
        })
    }


    static uploadImage(file: fileUpload.UploadedFile): Promise<string> {
        /*var metaData = {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public,max-age=72000'
        }*/
        const fileName = file.md5.slice(-6) + "-" + file.name

        return new Promise((resolve, reject) => {
            minioClient.putObject('restaurant', fileName, file.data, function (err, objInfo) {
                if (err) {
                    console.log(err)
                    return reject(err)
                }
                resolve(fileName)
            })
        })
    }
}