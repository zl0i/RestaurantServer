import express from 'express'
import fileUpload from 'express-fileupload';
import * as Minio from 'minio'
import { UploadedFile } from 'express-fileupload';

var minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env['STORAGE_USER'],
    secretKey: process.env['STORAGE_PASSWORD']
});




export default class ObjectStorage {

    static async connect() {
        return new Promise((resolve, reject) => {
            minioClient.bucketExists('restaurant', (err, res) => {
                if (res == false) {
                    minioClient.makeBucket('restaurant', '')
                        .then((val) => {
                            resolve(res)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                } else {
                    resolve(res)
                }
            })
        })

    }

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
                res.status(404).json({
                    message: err.message
                })
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

    static uploadImage(file: fileUpload.UploadedFile, prefix: string | number = ''): Promise<string | Error> {
        const fileName = file.md5.slice(-6) + '-' + prefix + '-' + file.name

        return new Promise((resolve, reject) => {
            minioClient.putObject('restaurant', fileName, file.data, function (err, _objInfo) {
                if (err)
                    return reject(err)

                resolve(fileName)
            })
        })
    }

    static putImage(req: express.Request, res: express.Response): void {
        const fileName: string = String(req.params.file)
        const file = req.files.icon as UploadedFile
        minioClient.putObject('restaurant', fileName, file.data, function (err, _objInfo) {
            if (err)
                res.status(500).end()

            res.json({
                result: 'ok'
            })
        })

    }

    static deleteImage(filename: string): Promise<boolean | Error> {
        return new Promise((resolve, reject) => {
            minioClient.removeObject('restaurant', filename, function (err) {
                if (err)
                    reject(err)

                resolve(true)
            })
        })
    }

    static async replaceImage(oldname: string, file: fileUpload.UploadedFile, prefix: string | number = ''): Promise<string | Error> {
        if (oldname != null)
            await ObjectStorage.deleteImage(oldname)
        return await ObjectStorage.uploadImage(file, prefix)
    }
}