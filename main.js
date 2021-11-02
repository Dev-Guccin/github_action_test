'use strict'
const axios = require('axios')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs = require('fs')
/*
선릉역, 삼성역
https://www.mangoplate.com/search/%EC%82%BC%EC%84%B1%EC%97%AD (삼성역)
https://www.mangoplate.com/search/%EC%84%A0%EB%A6%89%EC%97%AD (선릉역)
 */
const location = [
  'https://www.mangoplate.com/search/%EC%82%BC%EC%84%B1%EC%97%AD?keyword=%EC%82%BC%EC%84%B1%EC%97%AD&page=', // 삼성역
  'https://www.mangoplate.com/search/%EC%84%A0%EB%A6%89%EC%97%AD?keyword=%EC%84%A0%EB%A6%89%EC%97%AD&page=', // 선릉역
]

// axios를 활용해 AJAX로 HTML 문서를 가져오는 함수 구현
let ids = []
async function main() {
  for (let i = 0; i < 2; i++) {
    for (let page = 1; page < 10; page++) {
      let html
      try {
        html = await axios({
          method: 'get',
          url: location[i] + `${page}`,
          responseType: 'arraybuffer',
        })
      } catch (e) {
        console.log('!!')
        continue
      }
      let utfHtml = iconv.decode(html.data, 'UTF-8').toString()
      const $ = cheerio.load(utfHtml, { decodeEntities: false })

      const idlist = $(
        'body > main > article > div.column-wrapper > div > div > section > div.search-list-restaurants-inner-wrap > ul'
      ).children('li')

      for (let i = 0; i < idlist.length; i++) {
        let ltmp = $(idlist[i]).children('div').eq(0).find('a').attr('href')
        let rtmp = $(idlist[i]).children('div').eq(1).find('a').attr('href')
        ids.push(ltmp)
        ids.push(rtmp)
      }
    }
  }
  let result = []
  // 디테일한 정보 가져오자~
  for (let i = 0; i < ids.length; i++) {
    let html = await axios({
      method: 'get',
      url: 'https://www.mangoplate.com/' + `${ids[i]}`,
      responseType: 'arraybuffer',
    })
    let utfHtml = iconv.decode(html.data, 'UTF-8').toString()
    const $ = cheerio.load(utfHtml, { decodeEntities: false })

    const title = $(
      'body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > header > div.restaurant_title_wrap > span > h1'
    ).text()
    const score = $(
      'body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > header > div.restaurant_title_wrap > span > strong > span'
    ).text()
    const body = $(
      'body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > table > tbody'
    ).children('tr')
    let table = { 이름: title, 평점: score }
    for (let tr = 0; tr < body.length; tr++) {
      let key = $(body[tr])
        .children('th')
        .text()
        .replace(/\n/g, '')
        .replace(/ +/g, ' ')
      let val = $(body[tr])
        .children('td')
        .text()
        .replace(/\n/g, '')
        .replace(/ +/g, ' ')
      table[key] = val
    }
    result.push(table)
  }
  const file = JSON.stringify(result)
  fs.writeFileSync('food.json', file)
}
main()
