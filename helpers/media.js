import { extractCoordinates } from '../utils/coordinates'

// Yes, I hardcoded my shortlived readonly insta api token for this frontend-only POC :D
// But if you want to see my insta media, rather just connect with me, I will accept ;)
const INSTA_API_TOKEN = 'IGQVJVREFMaWVpQjMtMmFweEw1TW5TSDNYTFZA0LW5qS3BVS0lmRkprVzhWRzZAfckxVaG5GX1RaQlF0N2w2dnNLU1V6U1hLM09LRkoxQVh3MENFQ3FCQWkwOE9ER3I5Rll3M3Uya3JB'

// all fields: caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username

// Add a location or coordinates per post/album in the form "travelatam[lat,lon]"
// The client will make a stop there and request and display the photos.
//
// TODO: https://www.npmjs.com/package/node-geocoder
// get coordinates from location name

export async function getPosts() { // [{id, coordinates, caption}]
  const fields = 'id,caption'
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  return getPostsCoordinates(json.data)
}

export async function getPostItems(mediaId) {
  const fields = 'media_type,media_url'
  const url = `https://graph.instagram.com/${mediaId}/children?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  return getMediaUrls(json.data)
}

export function getPostsCoordinates(posts) {
  // TODO sort according timestamp
  return posts.reduce(function(postCoordinates, post) {
    const coordinates = extractCoordinates(post.caption || '')
    if (coordinates) {
      post['coordinates'] = coordinates
      postCoordinates.push(post);
    }
    return postCoordinates;
  }, []);
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

