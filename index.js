require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const port = process.env.PORT || 3000;
const {uploadToS3} = require('./pushToS3');

const acceptedFileType = ['image/png','image/jpeg','text/plain', 'application/pdf'];
const acceptedMaxFileSize = process.env.ACCEPTED_MAX_FILESIZE || 10; //configurable, currently set to 10Mbs

app.get('/', (req, res) => {
  res.status(200).send(`Server up and running`);
});

app.post('/', async (req, res) => {
    const query = new URLSearchParams(req.url);
    if (!query.get('/?fileName')) {
        res.status(400).send({status: 'error', msg: "Mandatory field fileName needs to be passed as query string param."});
    }
    const fileName = query.get('/?fileName');
    const fileSize = req.headers['content-length'];
    const fileType = req.headers['content-type'];

    if (fileSize < acceptedMaxFileSize*1048576) {
        if (acceptedFileType.indexOf(fileType) !== -1) {
            try {
                // streaming the file to S3
                const result = await uploadToS3(req, fileName); 
                if (result.status === "success") {
                    res.status(200).send({ status: 'success', msg: 'file uploaded to S3 successfully!' });
                }
            } catch (err) {
                console.log(err);
                res.status(500).send({staus: 'fail' });
            }
        } else {
            res.status(400).send({ status: 'error', msg: `${fileType} is not a supported fileType, only ${acceptedFileType.toString()} file type supported` });
        }
    } else {
        res.status(400).send({ status: 'error', msg: `The file exceeds max file size of ${acceptedMaxFileSize} MBs.` });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${process.env.PORT}/`);
});