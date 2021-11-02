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

// axios를 활용해 AJAX로 HTML 문서를 가져오는 함수 구현
async function getDetail() {
  try {
    return await axios({
      method: 'get',
      url: 'https://www.mangoplate.com/restaurants/2u-4-3abGwI4',
      responseType: 'arraybuffer',
    })
  } catch (error) {
    console.error(error)
  }
}

// getDetail 함수 실행 후 데이터에서
// body > main > div > section > ul > li > article > h2 > a
// 에 속하는 제목을 titleList에 저장
getDetail().then((html) => {
  let utfHtml = iconv.decode(html.data, 'UTF-8').toString()
  const $ = cheerio.load(utfHtml, { decodeEntities: false })

  const body = $(
    'body > main > article > div.column-wrapper > div.column-contents > div > section.restaurant-detail > table > tbody'
  ).children('tr')
  let table = {}
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
  console.log(table)
})
