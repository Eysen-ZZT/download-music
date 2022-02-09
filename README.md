# download-music

**思路步骤**

1. 引入所需要用到的node模块 （`request`，`cheerio`，`path`，`fs`）
2. 声明请求url，创建存储歌曲`hash`及文件名称的数组
3. 向请求路径发起请求，拿到data利用`cheerio.load()`对服务端dom进行操作
4. 利用`cheerio`的选择器及api【`toArray()`】提取对应数组
5. 遍历数组，提取歌曲`hash`值以及文件名
6. 再遍历提取出的`hash`列表，请求歌曲播放路径（[https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=E6472CAF9A1F2087C94BAE82B711ECA1&dfid=1Jdf0J2kJoqA1KV8pb1Tp5yh&album_id=53609966&_=1644309411237](https://)）利用模板字符串动态替换`hash`值，以及时间戳
7. 此时拿到的返回数据是没有的`play_url`的，但是可以拿到`album_id`，再次请求歌曲播放url，这次将`album_id`也一并携带上
8. 最终拿到请求返回数据的`play_url`，用`request`请求该url，再通过api【`pipe()`】和`fs.createWriteStream()`写入文件到对应的文件目录，销毁后触发 'close' 事件，最后通过 `on('close',callback)` 进行关闭

**注意点**

- 为了对应歌曲下载的文件名，需要在遍历hash列表的时候将`index`进行传递
- 过程中可能会遇到`Unhandled stream error in pipe.`管道中未处理的流错误，可以通过以下方式解决

```javascript
request(musicSrc)
  .on('error', err => console.log(err))
  .pipe(writeStream)
  .on('error', err => console.log(err))
  .on('close', callback);
```

- 其次可能发生的错误则是写入路径的问题，当你需要写入某个指定的文件夹时，你需要先在根目录下将改文件夹创建好，否则会报`error: -4058`的错误。
