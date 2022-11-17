import fs from 'fs'
import path from 'path';
import express, { Express } from "express";

const app = express()
const port = 9000

app.get('/', (req, res, next) => {
    const videoPath = path.join(__dirname, '/public/videos/vid1.mp4')
    const vidoeSize = fs.statSync(videoPath).size
    console.log(videoPath)
    res.send('Hello world')
})

app.get('/api/videos/:id', (req, res, next) => {
    const {range} = req.headers
    console.log(req.params)

    if(!range) return res.status(400).send('no range in request')


    const videoPath = path.join(__dirname, `/public/videos/${req.params.id}`)
    const videoSize = fs.statSync(videoPath).size
  
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})