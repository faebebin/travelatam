import os
import urllib.request

def main(args):
    fields = 'media_type,media_url'
    access_token = os.getenv('INSTA_API_TOKEN')
    media_id = args.get("media_id")
    url = f"https://graph.instagram.com/{media_id}/children?fields=${fields}&access_token={access_token}"
    print(url)
    with urllib.request.urlopen(url) as response:
        json_bytes = response.read()
    return {"body": json_bytes.decode('utf-8')}
