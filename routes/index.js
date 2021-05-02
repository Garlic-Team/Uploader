const router = require('express').Router();
const schema = require("../Models/account.js")

async function generateSecret() {
      var length = 30,
          charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
}

router.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Dashboard', user: req.session.user || null });
});

router.get('/editor', async(req, res) => {
    if(req.session.user) {
        var userInfo = await schema.findOne({username: req.session.user.id})
        if(!userInfo) {
          schema.create({
            username: req.session.user.id,
            secret: await generateSecret(),
            embedTitle: "Garlic Uploader",
            embedDescription: "Garlic Uploader Desc {date}",
            embedColor: "#eb4034",
            fakeLink: "https://upload.garlic-team.tk"
          })
          userInfo = await schema.findOne({username: req.session.user.id})
        }

       res.render('editor', { pageTitle: 'Editor', user: req.session.user || null, userInfo: userInfo });
    } else res.render('index', { pageTitle: 'Dashboard', user: req.session.user || null });
});

router.post('/editor', async(req, res) => {
    if(req.session.user) {
        var userInfo = await schema.findOne({username: req.session.user.id})
        if(!userInfo) {
          schema.create({
            username: req.session.user.id,
            secret: await generateSecret(),
            embedTitle: req.body.title,
            embedDescription: req.body.description,
            embedColor: req.body.color,
            fakeLink: req.body.fakeLink
          })
        } else {
          userInfo.embedTitle = req.body.title;
          userInfo.embedDescription = req.body.description;
          userInfo.embedColor = req.body.color;
          userInfo.fakeLink = req.body.fakeLink;
          await userInfo.save();
        }
        userInfo = await schema.findOne({username: req.session.user.id})

       res.render('editor', { pageTitle: 'Editor', user: req.session.user || null, userInfo: userInfo });
    } else res.render('index', { pageTitle: 'Dashboard', user: req.session.user || null });
});

module.exports = router;