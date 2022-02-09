const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
/*
  周杰伦 3520
  薛之谦 3060
*/
const reqUrl = 'https://www.kugou.com/yy/singer/home/3520.html';
const hashList = [];
const fileNames = [];

request(reqUrl, (error, response, body) => {
  if (!error && response.statusCode == 200) {
    createHashList(body);
  }
  for (let i = 0; i < hashList.length; i++) {
    const query = hashList[i];
    getMusicList(query, i);
  }
});

function getMusicList(query, index) {
  const _time = new Date().getTime();
  let reqUrl = '';
  if (typeof query === 'string') reqUrl = `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${query}&mid=d623201abd03d29e20a3d82495b4297e&_=${_time}`;
  else reqUrl = `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${query.hash}&mid=d623201abd03d29e20a3d82495b4297e&album_id=${query.album_id}&_=${_time}`
  request(reqUrl, (err, resp, body) => {
    cteatePlayUrlList(body, index);
  })
}

function createHashList(data) {
  const $ = cheerio.load(data);
  const musicList = $('#song_container input').toArray();
  for (const item of musicList) {
    const musicInfo = item.attribs.value.split('|');
    hashList.push(musicInfo[1]);
    fileNames.push(musicInfo[0]);
  }
}

function cteatePlayUrlList(body, index) {
  const { data } = JSON.parse(body);
  if (data.play_url === '') {
    getMusicList(data, index);
  } else {
    const { play_url } = data;
    const fileName = fileNames[index]
    downLoadMusic(play_url, fileName, () => {
      console.log(`${fileName} Download completed.`)
    });
  }
}

function downLoadMusic(musicSrc, fileName, callback) {
  request.head(musicSrc, function (err, resp, body) {
    if (err) {
      console.log('err: ' + err);
      return false;
    }
    const writeStream = fs.createWriteStream(path.resolve(__dirname, `audio/${fileName}.mp3`));
    request(musicSrc).pipe(writeStream).on('error', err => console.log(err)).on('close', callback);
  });
}