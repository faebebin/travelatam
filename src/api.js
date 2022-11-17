import { extractDateTime, extractLocationLatLon, fromLatLon } from '../utils/parseCaption'
import { abortController } from '../utils/promisify'
// import json from '../tests/fixtures/posts'

// all fields: caption,id,media_type,media_url,permalink,thumbnail_url,timestamp,username

// Add a location or coordinates per post/album in the form "travelatam[lat,lon]"
// The client will make a stop there and request and display the photos.

// Digital Ocean Function Namespace is used to store the API token and proxy the Instagram API requests.

export async function getPosts() {
  // FIXME setup dev API and according .env
  // if (!import.meta.env.VITE_API === 'dev') {
  const url = 'https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-45360257-2fa9-446d-9264-40a1030ad4c0/instagram/get_posts'
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
  const url = `https://faas-fra1-afec6ce7.doserverless.co/api/v1/web/fn-45360257-2fa9-446d-9264-40a1030ad4c0/instagram/get_post_items?media_id=${mediaId}`
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

