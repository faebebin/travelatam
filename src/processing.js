import { extractDateTime, extractLocationLatLon, fromLatLon } from '../utils/parseCaption'
import { abortController } from '../utils/promisify'
// import json from '../tests/fixtures/posts'


// TODO recipe:
// QGIS or OL?: 
// *  group / cluster photos (given radius)
// *  destinations (prior 'post') 
// *  destination photos
// *  process post data & sort date

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

