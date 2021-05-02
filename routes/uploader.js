const router = require('express').Router();
const imgur = require('imgur')
const fs = require("fs")
const axios = require('axios')
const mongoose = require('mongoose')
const moment = require('moment')

const imgm = require("../Models/imgid.js")
const schema = require("../Models/account.js")
imgur.setClientId("dc167161c8659c7")

mongoose.connect(process.env.db, {
    useNewUrlParser: true, useUnifiedTopology: true
})

async function generateSecret() {
      var length = 30,
          charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
}

async function generateId() {
    var length = 10,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function convert(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

router.get("/config", async(req, res) => {
  if(!req.session.user) return;

  var userInfo = await schema.findOne({username: req.session.user.id})
  if(!userInfo) {
    schema.create({
      username: req.session.user.id,
      secret: await generateSecret()
    })
    userInfo = await schema.findOne({username: req.session.user.id})
  }

    var file = `
{
  "Name": "${req.session.user.username}",
  "DestinationType": "Garlic Uploader",
  "RequestType": "POST",
  "RequestURL": "https://upload.garlic-team.tk/usystem/upload",
  "FileFormName": "file",
  "Headers": {
    "username": "${req.session.user.id}",
    "secret": "${userInfo.secret}",
    "url": "${userInfo.fakeLink}",
    "embedTitle": "${userInfo.embedTitle}",
    "embedDescription": "${userInfo.embedDescription}",
    "embedColor": "${userInfo.embedColor}",
  },
  "URL": "$json:url$"
}`

    res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=config.sxcu'});
    res.end(file);
})

router.post("/upload", async(req, res) => {
  if(!req.header("user-agent").startsWith("ShareX/")) return res.json({error:"Sorry only for ShareX"})
  if(!req.header("username")) return res.json({error:"Define username :d"})

  var f = await schema.findOne({username: req.header("username")})

  if(req.header("secret") !== f.secret) return res.json({error: "Bad secret key"})

  if(!req.files.file) return res.json({error: "No provided file"})

  var date = new Date()
  var files = fs.readdirSync('./files');
  req.files.file.mv(`./files/${date}`, (err) => {
    imgur.uploadFile("./files/"+date).then(async(json) => {
      var id = await generateId()
      await imgm.create({id: id, url: json.link, user: req.header("username"), size: await convert(json.size), date: moment(date).format("LLLL"), embedTitle: req.header("embedTitle"), embedDescription: req.header("embedDescription").replace(/{date}/g,moment(date).format("LLLL")), embedColor: req.header("embedColor")})

		  res.status(200).json({url: `${req.header("url")} ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|||||||||||| https://upload.garlic-team.tk/usystem/${id}`})

      fs.unlinkSync("./files/"+date)
    }).catch(err => {
      console.log(err)
      res.status(400).json({error: err.message.message});
      fs.unlinkSync("./files/"+date)
    })
    
  })
})

router.get("/:id", async(req, res) => {
  var ff = await imgm.findOne({id: req.params.id})
  if(!ff) return res.redirect("/")

  let resp = (await axios({
    method: "GET",
    url: new URL(`${ff.url}`).toString(),
    responseType: "arraybuffer"
  })).data;
  
  res.render("img", {rawlink: ff.url, link: `data:image/png;base64,${Buffer.from(resp).toString("base64")}`, date: ff.date ? ff.date : "???", user: ff.user, size: ff.size ? ff.size : "???", embedTitle: ff.embedTitle, embedDescription: ff.embedDescription, embedColor: ff.embedColor})
})

module.exports = router;