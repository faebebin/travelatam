import { describe, expect, it } from 'vitest'
import { getMediaUrls } from '../helpers/media'

const data = {
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
    expect(getMediaUrls(data.data)).toEqual(['url1', 'url3']);
  });
});
