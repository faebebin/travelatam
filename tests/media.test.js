import { describe, expect, it } from 'vitest'
import { getMediaUrls, getPostsCoordinates } from '../helpers/media'
import { fromLatLon } from '../utils/coordinates'

const posts = {
  "data": [
    {
      "id": "17952176918177715",
      "caption": "Cartagena, [10.425664,-75.548631]"
    },
    {
      "id": "17864596673760827"
    },
    {
      "id": "17988232330581426",
      "caption": "Bogota, [4.605762,-74.055313]"
    },
    {
      "id": "18031800007247472",
      "caption": "Schweizer Schwan"
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
  it('returns only coordinates if caption contains them', () => {
    const captionAndCoordinates = [
      {
        id: "17952176918177715",
        coordinates: fromLatLon([10.425664, -75.548631]),
        caption: "Cartagena, [10.425664,-75.548631]"
      },
      {
        id: "17988232330581426",
        coordinates: fromLatLon([4.605762, -74.055313]),
        caption: "Bogota, [4.605762,-74.055313]"
      },
    ]
    expect(getPostsCoordinates(posts.data)).toEqual(captionAndCoordinates);
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


