import { extractDateTime, extractLocationLatLon, fromLatLon } from '../utils/parseCaption'
import { abortController } from '../utils/promisify'
// import json from '../tests/fixtures/posts'

// Yes, I hardcoded my shortlived readonly insta api token for this frontend-only POC :D
// But if you want to consume my insta media, rather just connect with me, I will accept ;)
const INSTA_API_TOKEN = 'IGQVJVREFMaWVpQjMtMmFweEw1TW5TSDNYTFZA0LW5qS3BVS0lmRkprVzhWRzZAfckxVaG5GX1RaQlF0N2w2dnNLU1V6U1hLM09LRkoxQVh3MENFQ3FCQWkwOE9ER3I5Rll3M3Uya3JB'

// all fields: caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username

// Add a location or coordinates per post/album in the form "travelatam[lat,lon]"
// The client will make a stop there and request and display the photos.

export async function getPosts() {
  const fields = 'id,caption,media_type,media_url,timestamp'
  // FIXME setup dev API and according .env
  // if (!import.meta.env.VITE_API === 'dev') {
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  // ? 'http://localhost:8000/tests/fixtures/posts.json'
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  // }
  return await processPosts(json.data)
}

export async function getPostItems(mediaId) {
  const fields = 'media_type,media_url'
  // const url = import.meta.env.VITE_API === 'dev'  ? 'http://localhost:8000/tests/fixtures/postItems.json'
  const url = `https://graph.instagram.com/${mediaId}/children?fields=${fields}&access_token=${INSTA_API_TOKEN}`
  const response = await fetch(url)
  // TODO if !response.ok { return text}
  const json = await response.json()
  return json.data
}

export async function processPosts(posts) {
  abortController.signal.addEventListener("abort", () => {
    Promise.reject();
  });

  const processedPosts = await Promise.allSettled(
    posts.map(post => processPost(post))
  )
  const readyPosts = processedPosts.reduce((posts, post) => {
    if (post.status === 'fulfilled') {
      posts.push(post.value)
    }
    return posts
  },
    []
  )
  readyPosts.sort(sortPosts)
  return readyPosts
}

async function processPost(post) { // Promise
  abortController.signal.addEventListener("abort", () => {
    Promise.reject();
  });

  const { caption, timestamp } = post
  const latLon = await extractLocationLatLon(caption)
  if (!latLon) return Promise.reject('No location information')
  // NOTE: Location information is required
  post['coordinates'] = fromLatLon(latLon)
  const date = extractDateTime(caption) || new Date(timestamp)
  post['date'] = date
  return Promise.resolve(post)
}

function sortPosts(a, b) {
  if (a.date < b.date) return -1;
  if (a.date > b.date) return 1;
  return 0;
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

