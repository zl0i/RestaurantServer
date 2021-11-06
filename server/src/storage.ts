import express from 'express'
import fileUpload from 'express-fileupload';
import * as Minio from 'minio'
import { UploadedFile } from 'express-fileupload';



export default class ObjectStorage {

    static __minioClient: Minio.Client

    static async connect(options: Minio.ClientOptions) {
        return new Promise((resolve, reject) => {
            ObjectStorage.__minioClient = new Minio.Client(options)
            ObjectStorage.__minioClient.bucketExists('restaurant', (err, res) => {
                if (err)
                    reject(err)

                if (res == false) {
                    ObjectStorage.__minioClient.makeBucket('restaurant', '')
                        .then((_val) => {
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

    static listImages(_req: express.Request, res: express.Response) {
        console.log(ObjectStorage.__minioClient)
        const stream = ObjectStorage.__minioClient.listObjects('restaurant', '', true)
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
        ObjectStorage.__minioClient.getObject('restaurant', req.params.file, function (err, dataStream) {
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
            ObjectStorage.__minioClient.putObject('restaurant', fileName, file.data, function (err, _objInfo) {
                if (err)
                    return reject(err)

                resolve(fileName)
            })
        })
    }

    static putImage(req: express.Request, res: express.Response): void {
        const fileName: string = String(req.params.file)
        const file = req.files.icon as UploadedFile
        ObjectStorage.__minioClient.putObject('restaurant', fileName, file.data, function (err, _objInfo) {
            if (err)
                res.status(500).end()

            res.json({
                result: 'ok'
            })
        })

    }

    static deleteImage(filename: string): Promise<boolean | Error> {
        return new Promise((resolve, reject) => {
            ObjectStorage.__minioClient.removeObject('restaurant', filename, function (err) {
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