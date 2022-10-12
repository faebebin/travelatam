import { extractLocationLatLon, fromLatLon } from '../utils/parseCaption'

// Yes, I hardcoded my shortlived readonly insta api token for this frontend-only POC :D
// But if you want to see my insta media, rather just connect with me, I will accept ;)
const INSTA_API_TOKEN = 'IGQVJVREFMaWVpQjMtMmFweEw1TW5TSDNYTFZA0LW5qS3BVS0lmRkprVzhWRzZAfckxVaG5GX1RaQlF0N2w2dnNLU1V6U1hLM09LRkoxQVh3MENFQ3FCQWkwOE9ER3I5Rll3M3Uya3JB'

// all fields: caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username

// Add a location or coordinates per post/album in the form "travelatam[lat,lon]"
// The client will make a stop there and request and display the photos.

export async function getPosts() {
  const fields = 'id,caption,media_type,media_url,timestamp'
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  const coordinates = await getPostsCoordinates(json.data)
  return coordinates
}

export async function getPostItems(mediaId) {
  const fields = 'media_type,media_url'
  const url = `https://graph.instagram.com/${mediaId}/children?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  return json.data
}

export async function getPostsCoordinates(posts) {
  // TODO sort according timestamp
  const postsWithCoordinates = []
  for await (const post of posts) {
    const latLon = await extractLocationLatLon(post.caption)
    const coordinates = fromLatLon(latLon || '')
    if (coordinates) {
      post['coordinates'] = coordinates
      postsWithCoordinates.push(post);
    }
  }
  return postsWithCoordinates
}

export function getMediaUrls(mediaItems) {
  return mediaItems.reduce(function(urls, item) {
    if (item.media_type === 'IMAGE') {
      urls.push(item.media_url);
    }
    // TODO if (item.media_type === 'VIDEO') { thumbnail_url
    return urls;
  }, []);
}

