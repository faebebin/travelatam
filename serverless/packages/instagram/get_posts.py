import os
import urllib.request

def main(args):
    fields = 'id,caption,media_type,media_url,timestamp'
    access_token = os.getenv('INSTA_API_TOKEN')
    url = f"https://graph.instagram.com/me/media?fields={fields}&access_token={access_token}"
    print(url)
    with urllib.request.urlopen(url) as response:
        json_bytes = response.read()
    return {"body": json_bytes.decode('utf-8')}
