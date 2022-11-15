import expressAsyncHandler from 'express-async-handler'
import { app } from '../webserver.js'

const robotsTemplate = `User-agent: *
Allow: *
Disallow: /offline.html
Sitemap: https://{host}/sitemap.xml`

app.get('/robots.txt', expressAsyncHandler((req, res) => {
    res.contentType('text/plain')
    res.end(robotsTemplate.replace('{host}', req.hostname))
}))
