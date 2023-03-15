// env vars: apikey: nps api key; imgbbkey: imgbb api key; username: wasteof username; wasteofpassword: wasteof password
import ApiClient from 'imgbb';
import { Wasteof2Auth } from "wasteof-client"
let username = process.env.username
const wasteof2 = new Wasteof2Auth(username, process.env.wasteofpassword)
import axios from 'axios'
let key = process.env.apikey
let imgbbkey = process.env.imgbbkey
const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}
async function main() {
  let stateAbbrs = Object.keys(states);
  let chosenState = stateAbbrs[getRandomIntInclusive(0, stateAbbrs.length)];
  let results
  try {
  let httpResult = await axios.get(`https://developer.nps.gov/api/v1/parks?stateCode=${chosenState}&limit=100&fields=images&api_key=${key}`);
  results = await httpResult.data
  } catch (e) {
    console.error(e)
  }
  let data = results.data.filter(r => r.images.length);
  let selectedPark = data[getRandomIntInclusive(0, data.length - 1)];
  let selectedImage = selectedPark.images[getRandomIntInclusive(0, selectedPark.images.length - 1)];
  let imageRequest = await axios.get(selectedImage.url, {responseType: 'arraybuffer', headers: { 'user-agent': 'Chrome' } });
  let imagestring = Buffer.from(imageRequest.data, 'binary').toString('base64')
  let api = new ApiClient.ImgBB({
    token: imgbbkey,
   });
  let ret
  try {
  ret = await api.upload({
   image: imagestring,
  })
  } catch (e) {
      console.error(e)
  }
  return {image: ret.data, park: selectedPark,imageinfo:selectedImage}
};

main().then(async (res) => {
  await wasteof2.login()
  wasteof2.post(`<h1>${res.park.fullName}</h1><p></p><i>${res.park.description}</i><p>Photo: "${res.imageinfo.caption}" - ${res.imageinfo.credit}<img src=${res.image.url} />`,null)
  console.log("done")
})
