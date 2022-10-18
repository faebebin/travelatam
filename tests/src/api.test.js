import { describe, expect, it } from 'vitest'
import { getMediaUrls, processPosts } from '../../src/api'
import { fromLatLon } from '../../utils/parseCaption'

const posts = {
  "data": [
    {
      "id": "17952176918177715",
      "caption": "Cartagena, [10.425664,-75.548631] 10.9.2022  20:00 chevre", // includes date and time
      "timestamp": "2022-10-06T14:25:56+0000"
    },
    {
      "id": "17864596673760827"
    },
    {
      "id": "17988232330581426",
      "caption": "Bogota, [4.605762,-74.055313]",
      "timestamp": "2022-10-06T14:22:40+0000"
    },
    {
      "id": "18031800007247472",
      "caption": "Schweizer Schwan"
    },
    {
      "id": "18031800007247499",
      "caption": "Zürich [ 40.425664, 10.548631] 10.9.2022 so guet", // include date
      "timestamp": "2022-10-06T14:22:40+0000"
    },
    {
      "id": "17915301601392503",
      "caption": "m\u1ed9t hai ba yoooo"
    },
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUmd6alB0U0VpUUZAfQ2pRRU1BQ0g1bUtrZAE1XYWVHZAmNrZA2NUdjBwOGpOUWlvd2c2WmRaeWhrSTBzM1N5N094QVB1Y2dZAQzVDeW5JbE9TWlIwX0ZAtVUNn",
      "after": "QVFIUmdRMGpTVHQzLUI3LUs0UnlEVkpyOXBaSk9jR2VTNFpnLXk5eWwtdWtiTTZA3QTRsN3RFb3dCem5ZATWZAFUll0SGJtdTRCMHZAnLW0xaFI1Qm9Ra0VZAWUp3"
    }
  }
}

describe("getPostsCoordinates", () => {
  it('returns only coordinates if caption contains them', async () => {
    // TODO mock the osm location names search
    const captionAndCoordinates = [
      {
        "caption": "Zürich [ 40.425664, 10.548631] 10.9.2022 so guet",
        "coordinates": [
          1174268.2314861403,
          4927992.7926541045,
        ],
        "date": new Date("2022-9-10"),
        "id": "18031800007247499",
        "timestamp": "2022-10-06T14:22:40+0000",
      },
      {
        "caption": "Cartagena, [10.425664,-75.548631] 10.9.2022  20:00 chevre",
        "coordinates": [
          -8410035.133048922,
          1167037.646029753,
        ],
        "date": new Date("2022-9-10 20:00"),
        "id": "17952176918177715",
        "timestamp": "2022-10-06T14:25:56+0000",
      },
      {
        id: "17988232330581426",
        coordinates: fromLatLon([4.605762, -74.055313]),
        caption: "Bogota, [4.605762,-74.055313]",
        timestamp: "2022-10-06T14:22:40+0000",
        date: new Date("2022-10-06T14:22:40+0000"),
      }
    ]
    expect(await processPosts(posts.data)).toEqual(captionAndCoordinates);
  });
});

const postChildren = {
  // TODO get from fixtures
  "data": [
    {
      "id": "17944794437497875",
      "media_type": "IMAGE",
      "media_url": "url1",
      "permalink": "https://www.instagram.com/p/CjYB5p0M2dDB3Jq481Rb1l9hb3tBO_RVuN3P6A0/",
      "timestamp": "2022-10-06T14:22:39+0000"
    },
    {
      "id": "17946409994111306",
      "media_type": "VIDEO",
      "media_url": "url2",
      "permalink": "https://www.instagram.com/p/CjYB5qAMye7MajBLLpV3O-34f2k2N_f1hNmWVE0/",
      "timestamp": "2022-10-06T14:22:39+0000"
    },
    {
      "id": "17963040613856609",
      "media_type": "IMAGE",
      "media_url": "url3",
      "permalink": "https://www.instagram.com/p/CjYB5p0ML_VjOP0saWHgbI7xiJiHst5QZGH1rM0/",
      "timestamp": "2022-10-06T14:22:39+0000"
    }
  ]
}

describe("getMediaUrls", () => {
  it('returns only urls for type IMAGE', () => { // TODO adjust for vide thumbnails
    expect(getMediaUrls(postChildren.data)).toEqual(['url1', 'url3']);
  });
});


