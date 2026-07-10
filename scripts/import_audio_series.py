#!/usr/bin/env python3
"""
WordPress Audio Series Importer for FOI Academy
- Crawls a WordPress site (via RSS or HTML page)
- Checks if the audio product series already exists on the server
- Skips downloading/uploading tracks that are already present in the existing product
- Downloads and uploads any missing tracks
- Updates/publishes the audio product with the full accumulated track list
"""
import os
import sys
import json
import re
import ssl
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
import random
import time
import subprocess
from datetime import datetime

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

MAX_RETRIES = 5
RETRY_BASE_DELAY = 4

# Bitrate tables for MP3 duration estimation
BITRATES = {
    1: { # MPEG-1
        1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448], # Layer I
        2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],    # Layer II
        3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]     # Layer III
    },
    2: { # MPEG-2 & 2.5
        1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
        2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
        3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
    }
}

def parse_duration_to_seconds(dur_str):
    """Parse time string like H:MM:SS, MM:SS or integer minutes to seconds."""
    try:
        if not dur_str:
            return 0
        dur_str = dur_str.strip()
        if ':' in dur_str:
            parts = list(map(int, dur_str.split(':')))
            if len(parts) == 3:
                return parts[0] * 3600 + parts[1] * 60 + parts[2]
            elif len(parts) == 2:
                return parts[0] * 60 + parts[1]
        else:
            # Maybe it is just numeric minutes, e.g. "45" or "45 min"
            clean_str = re.sub(r'[^\d]', '', dur_str)
            if clean_str:
                return int(clean_str) * 60
    except Exception:
        pass
    return 0

def format_seconds_to_friendly(seconds):
    """Format seconds into X hr Y min or Z min."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    if hours > 0:
        if minutes > 0:
            return f"{hours} hr {minutes} min"
        return f"{hours} hr"
    return f"{minutes} min"

def get_audio_duration(file_path):
    """Calculate duration of a local MP3 file."""
    try:
        if not os.path.exists(file_path):
            return "45:00"
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return "45:00"

        with open(file_path, 'rb') as f:
            header = f.read(10)
            if len(header) < 10:
                return "45:00"
            offset = 0
            if header[0:3] == b'ID3':
                size = ((header[6] & 0x7F) << 21) | \
                       ((header[7] & 0x7F) << 14) | \
                       ((header[8] & 0x7F) << 7)  | \
                       (header[9] & 0x7F)
                offset = size + 10
                f.seek(offset)

            buffer = f.read(4096)
            if len(buffer) < 4:
                return "45:00"

            for i in range(len(buffer) - 3):
                if buffer[i] == 0xFF and (buffer[i+1] & 0xE0) == 0xE0:
                    b1 = buffer[i+1]
                    b2 = buffer[i+2]
                    version_bits = (b1 & 0x18) >> 3
                    version = 1
                    if version_bits == 0:
                        version = 2.5
                    elif version_bits == 2:
                        version = 2

                    layer_bits = (b1 & 0x06) >> 1
                    layer = 4 - layer_bits if layer_bits in [1, 2, 3] else 3
                    bitrate_idx = (b2 & 0xF0) >> 4
                    if bitrate_idx == 0 or bitrate_idx == 15:
                        continue

                    if version == 1:
                        br_list = BITRATES[1].get(layer, BITRATES[1][3])
                    else:
                        br_list = BITRATES[2].get(layer, BITRATES[2][3])

                    bitrate = br_list[bitrate_idx]
                    audio_bytes = file_size - offset
                    duration_seconds = int(audio_bytes / (bitrate * 1000 / 8))

                    hours = duration_seconds // 3600
                    minutes = (duration_seconds % 3600) // 60
                    seconds = duration_seconds % 60
                    if hours > 0:
                        return f"{hours}:{minutes:02d}:{seconds:02d}"
                    else:
                        return f"{minutes:02d}:{seconds:02d}"
    except Exception as e:
        print(f"  Warning: Error calculating local audio duration: {e}")
    return "45:00"

def get_remote_audio_duration(audio_url):
    """Estimate duration of a remote audio file by parsing its content length."""
    try:
        content_length = 0
        cmd_head = ['curl.exe', '-k', '-I', '-L', '-s', '--connect-timeout', '10', audio_url]
        res_head = subprocess.run(cmd_head, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        for line in res_head.stdout.split('\n'):
            if line.lower().startswith('content-length:'):
                try:
                    content_length = int(line.split(':')[1].strip())
                except:
                    pass

        if content_length == 0:
            req = urllib.request.Request(audio_url, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as resp:
                    content_length = int(resp.headers.get('Content-Length', 0))
            except:
                pass

        if content_length == 0:
            return "45:00"

        cmd_range = ['curl.exe', '-k', '-L', '-r', '0-8192', '-s', '--connect-timeout', '10', audio_url]
        res_range = subprocess.run(cmd_range, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        buffer = res_range.stdout

        if len(buffer) < 4:
            req = urllib.request.Request(audio_url, headers={'Range': 'bytes=0-8192', 'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as resp:
                    buffer = resp.read()
            except:
                pass

        if len(buffer) < 10:
            return "45:00"

        offset = 0
        if buffer[0:3] == b'ID3':
            size = ((buffer[6] & 0x7F) << 21) | \
                   ((buffer[7] & 0x7F) << 14) | \
                   ((buffer[8] & 0x7F) << 7)  | \
                   (buffer[9] & 0x7F)
            offset = size + 10

        for i in range(offset, len(buffer) - 3):
            if buffer[i] == 0xFF and (buffer[i+1] & 0xE0) == 0xE0:
                b1 = buffer[i+1]
                b2 = buffer[i+2]
                version_bits = (b1 & 0x18) >> 3
                version = 1
                if version_bits == 0:
                    version = 2.5
                elif version_bits == 2:
                    version = 2

                layer_bits = (b1 & 0x06) >> 1
                layer = 4 - layer_bits if layer_bits in [1, 2, 3] else 3
                bitrate_idx = (b2 & 0xF0) >> 4
                if bitrate_idx == 0 or bitrate_idx == 15:
                    continue

                if version == 1:
                    br_list = BITRATES[1].get(layer, BITRATES[1][3])
                else:
                    br_list = BITRATES[2].get(layer, BITRATES[2][3])

                bitrate = br_list[bitrate_idx]
                audio_bytes = content_length - offset
                duration_seconds = int(audio_bytes / (bitrate * 1000 / 8))

                hours = duration_seconds // 3600
                minutes = (duration_seconds % 3600) // 60
                seconds = duration_seconds % 60
                if hours > 0:
                    return f"{hours}:{minutes:02d}:{seconds:02d}"
                else:
                    return f"{minutes:02d}:{seconds:02d}"
    except Exception as e:
        print(f"  Warning: Error calculating remote audio duration: {e}")
    return "45:00"

def get_browser_headers(referer=""):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
    }
    if referer:
        headers['Referer'] = referer
    return headers

def fetch_url(url, timeout=30, max_retries=MAX_RETRIES):
    """Fetch URL contents with curl.exe fallback to handle Cloudflare/bot limits."""
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            cmd = [
                'curl.exe', '-k', '-sS', '-L', '--max-time', str(timeout),
                '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                url
            ]
            result = subprocess.run(cmd, capture_output=True, timeout=timeout + 5)
            if result.returncode == 0:
                return result.stdout
            else:
                raise Exception(f"curl failed code {result.returncode}")
        except Exception as e:
            try:
                req = urllib.request.Request(url, headers=get_browser_headers(url))
                with urllib.request.urlopen(req, context=SSL_CTX, timeout=timeout) as response:
                    return response.read()
            except Exception as e2:
                last_error = e2
                if attempt < max_retries:
                    time.sleep(RETRY_BASE_DELAY * attempt)
    raise last_error

def download_file(url, local_filepath, max_retries=MAX_RETRIES):
    """Download a file locally using curl or urllib."""
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            cmd = ['curl.exe', '-k', '-#', '-L', '-o', local_filepath, '--max-time', '300', url]
            result = subprocess.run(cmd, timeout=300)
            if result.returncode == 0 and os.path.exists(local_filepath) and os.path.getsize(local_filepath) > 0:
                return True
            else:
                raise Exception("curl download failed")
        except Exception as e:
            try:
                req = urllib.request.Request(url, headers=get_browser_headers(url))
                with urllib.request.urlopen(req, context=SSL_CTX, timeout=120) as response:
                    total_size = int(response.info().get('Content-Length', 0))
                    downloaded = 0
                    block_size = 1024 * 64
                    with open(local_filepath, 'wb') as f:
                        while True:
                            buffer = response.read(block_size)
                            if not buffer:
                                break
                            f.write(buffer)
                            downloaded += len(buffer)
                            if total_size > 0:
                                percent = min(100, int(downloaded * 100 / total_size))
                                sys.stdout.write(f"\r  Downloading: {percent}% ({downloaded / (1024*1024):.1f}MB)")
                                sys.stdout.flush()
                    if total_size > 0:
                        print()
                    return True
            except Exception as e2:
                last_error = e2
                if os.path.exists(local_filepath):
                    try:
                        os.remove(local_filepath)
                    except:
                        pass
                if attempt < max_retries:
                    time.sleep(RETRY_BASE_DELAY * attempt)
    raise last_error

def clean_html(raw_html):
    if not raw_html:
        return ""
    return re.sub(r'<.*?>', '', raw_html).strip()

def parse_rss_feed(url):
    print(f"Fetching RSS feed from: {url}...")
    xml_data = fetch_url(url)
    root = ET.fromstring(xml_data)
    items = []

    ns = {
        'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'media': 'http://search.yahoo.com/mrss/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }

    for item in root.findall('.//item'):
        title = item.find('title')
        title_text = title.text if title is not None else "Untitled Audio"

        audio_url = ""
        enclosure = item.find('enclosure')
        if enclosure is not None:
            audio_url = enclosure.get('url', '')

        description = ""
        desc_node = item.find('description')
        if desc_node is not None:
            description = clean_html(desc_node.text)

        image_url = ""
        itunes_image = item.find('itunes:image', ns)
        if itunes_image is not None:
            image_url = itunes_image.get('href', '')

        pub_date = ""
        date_node = item.find('pubDate')
        if date_node is not None:
            pub_date = date_node.text

        duration = ""
        itunes_dur = item.find('itunes:duration', ns)
        if itunes_dur is not None and itunes_dur.text:
            duration = itunes_dur.text.strip()

        if audio_url:
            items.append({
                'title': title_text,
                'audioUrl': audio_url,
                'imageUrl': image_url,
                'description': description,
                'date': pub_date,
                'duration': duration
            })
    return items

def extract_details_from_post(url):
    print(f"  Visiting page: {url}...")
    try:
        time.sleep(1.0)
        html = fetch_url(url).decode('utf-8', errors='ignore')

        title = ""
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).split('|')[0].split(' - ')[0].strip()

        description = ""
        desc_match = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\'](.*?)["\']', html, re.IGNORECASE)
        if desc_match:
            description = desc_match.group(1).strip()

        image_url = ""
        img_match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']', html, re.IGNORECASE)
        if img_match:
            image_url = img_match.group(1).strip()

        audio_url = ""
        audio_match = re.search(r'(?:href|src)=["\']([^"\'>\s]+\.(?:mp3|m4a|wav|ogg|aac)(?:\?[^"\'>\s]*)?)["\']', html, re.IGNORECASE)
        if audio_match:
            matched_url = audio_match.group(1).strip()
            audio_url = matched_url if matched_url.startswith('http') else urllib.parse.urljoin(url, matched_url)

        if audio_url:
            return {
                'title': title if title else "Untitled Audio",
                'audioUrl': audio_url,
                'imageUrl': image_url,
                'description': description,
                'date': datetime.now().strftime("%Y-%m-%d"),
                'duration': ""
            }
    except Exception as e:
        print(f"    Error parsing page: {e}")
    return None

def parse_html_page(url):
    print(f"Scraping listing page: {url}...")
    html = fetch_url(url).decode('utf-8', errors='ignore')

    link_pattern = re.compile(r'href=["\'](https?://[^"\']+)["\']', re.IGNORECASE)
    all_links = list(set(link_pattern.findall(html)))

    parsed_source = urllib.parse.urlparse(url)
    source_domain = parsed_source.netloc

    post_links = []
    for link in all_links:
        parsed_link = urllib.parse.urlparse(link)
        if parsed_link.netloc != source_domain:
            continue
        if any(x in link.lower() for x in ['/category/', '/tag/', '/feed/', '/page/', '/wp-content/', '/wp-admin/', 'facebook.com', 'twitter.com']):
            continue
        if '/sermon/' in link.lower() or '/sermons/' in link.lower() or '/podcast/' in link.lower():
            if link != url:
                post_links.append(link)

    items = []
    if post_links:
        print(f"\nFound {len(post_links)} potential detail pages.")
        scan_choice = input("Scan these pages for audio? (y/n) [y]: ").strip().lower()
        if scan_choice != 'n':
            for post_url in post_links:
                details = extract_details_from_post(post_url)
                if details:
                    items.append(details)
            return items

    # Fallback to direct audio links on listing page
    audio_pattern = re.compile(r'(?:href|src)=["\']([^"\'>\s]+\.(?:mp3|m4a|wav|ogg|aac)(?:\?[^"\'>\s]*)?)["\']', re.IGNORECASE)
    audio_links = list(set(audio_pattern.findall(html)))

    for idx, matched_link in enumerate(audio_links):
        full_audio_url = matched_link if matched_link.startswith('http') else urllib.parse.urljoin(url, matched_link)
        filename = os.path.basename(urllib.parse.urlparse(full_audio_url).path)
        title = os.path.splitext(filename)[0].replace('-', ' ').replace('_', ' ').title()
        items.append({
            'title': title,
            'audioUrl': full_audio_url,
            'imageUrl': "",
            'description': "Scraped directly from page link.",
            'date': datetime.now().strftime("%Y-%m-%d"),
            'duration': ""
        })
    return items

def upload_file_to_platform(api_base, local_filepath, original_name, upload_type="audio"):
    """Upload file via multipart/form-data to the platform server using curl or urllib."""
    endpoint = f"/api/upload/{upload_type}"
    url = f"{api_base}{endpoint}"
    
    # Try using curl.exe first
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"  Uploading via curl.exe (attempt {attempt}/{MAX_RETRIES})...")
            cmd = [
                'curl.exe', '-k', '-sS', '-L', '-X', 'POST',
                '-F', f'{upload_type}=@{local_filepath}',
                url
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            if result.returncode == 0:
                res_data = json.loads(result.stdout.strip())
                if 'url' in res_data:
                    return res_data['url']
                else:
                    raise Exception(f"Invalid response from server: {result.stdout}")
            else:
                raise Exception(f"curl process returned exit code {result.returncode}. Stderr: {result.stderr}")
        except Exception as e:
            print(f"  Curl upload attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BASE_DELAY * attempt)
                
    # Fallback to urllib
    print("  Falling back to urllib multipart upload...")
    boundary = '----FormBoundary' + ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=16))
    filename = os.path.basename(local_filepath)
    
    content_type = 'application/octet-stream'
    if filename.lower().endswith('.mp3'):
        content_type = 'audio/mpeg'
    elif filename.lower().endswith(('.jpg', '.jpeg')):
        content_type = 'image/jpeg'
    elif filename.lower().endswith('.png'):
        content_type = 'image/png'
    elif filename.lower().endswith('.webp'):
        content_type = 'image/webp'

    part_headers = (
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"{upload_type}\"; filename=\"{filename}\"\r\n"
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode('utf-8')
    
    try:
        with open(local_filepath, 'rb') as f:
            file_data = f.read()
    except Exception as e:
        print(f"  Failed to read file for fallback upload: {e}")
        return None
        
    part_footers = f"\r\n--{boundary}--\r\n".encode('utf-8')
    body = part_headers + file_data + part_footers
    
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            'Content-Type': f'multipart/form-data; boundary={boundary}',
            'Content-Length': str(len(body))
        },
        method='POST'
    )
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=600) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                return res_data.get('url')
        except Exception as e:
            print(f"  Urllib upload attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BASE_DELAY * attempt)
    return None

def fetch_existing_audios(api_base):
    """Fetch list of existing audio products on the server."""
    url = f"{api_base}/api/audios"
    req = urllib.request.Request(url, headers={'Accept': 'application/json'}, method='GET')
    try:
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Warning: Could not fetch existing audios: {e}")
        return []

def save_audio_product(api_base, payload, product_id=None):
    """Create or update the audio product in DB."""
    if product_id:
        url = f"{api_base}/api/audios/{product_id}"
        method = "PUT"
        print(f"Updating existing audio product ID {product_id}...")
    else:
        url = f"{api_base}/api/audios"
        method = "POST"
        print("Creating new audio product...")
        
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=body,
        headers={'Content-Type': 'application/json'},
        method=method
    )
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=30) as response:
        return json.loads(response.read().decode('utf-8'))

def main():
    print("=" * 60)
    print("       WORDPRESS AUDIO SERIES IMPORTER")
    print("=" * 60)

    print("Select Operation:")
    print("  [1] Auto-Sync 'Sons & Daughters Network (Private)' (Recommended)")
    print("  [2] Advanced/Manual Import (choose title, customize pricing, category, etc.)")
    op_choice = input("Enter choice [1]: ").strip()
    if not op_choice:
        op_choice = "1"

    if op_choice == "1":
        api_base = "https://sop.joshuasgeneration.com"
        product_title = "Sons & Daughters Network (Private)"
        print(f"\nTargeting Server: {api_base}")
        print(f"Product Series Title: {product_title}")

        # Fetch existing products to check for series
        print("Fetching existing products from server to check for series...")
        existing_products = fetch_existing_audios(api_base)
        
        existing_product = None
        for p in existing_products:
            if p.get('title', '').strip().lower() == product_title.strip().lower():
                existing_product = p
                break

        existing_tracks = []
        existing_track_titles = set()
        existing_tracks_by_title = {}
        product_id = None

        if existing_product:
            product_id = existing_product.get('id')
            print(f"\n-> Found existing Audio Product series: '{product_title}' (ID: {product_id})")
            existing_tracks = existing_product.get('tracks', [])
            for t in existing_tracks:
                clean_t = t.get('title', '').strip().lower()
                existing_track_titles.add(clean_t)
                existing_tracks_by_title[clean_t] = t
            print(f"   Currently has {len(existing_tracks)} tracks registered on server.")
            
            artist = existing_product.get('artist', 'Apostle Joshua Iyemifokhae')
            description = existing_product.get('description', 'Sons & Daughters Network (Private) audio series.')
            category = existing_product.get('category', 'Prophetic')
            price = existing_product.get('price', 0.0)
            original_price = existing_product.get('originalPrice')
            default_cover = existing_product.get('coverUrl', '')
        else:
            print(f"\n-> No existing Audio Product found with title '{product_title}'. A new series will be created.")
            artist = "Apostle Joshua Iyemifokhae"
            description = "Sons & Daughters Network (Private) audio series."
            category = "Prophetic"
            price = 0.0
            original_price = None
            default_cover = ""

        # Prompt only for WordPress URL
        default_source = "https://joshuasgeneration.net/latest-sermons/"
        source_url = input(f"Enter WordPress Listing page or RSS Feed URL [{default_source}]: ").strip()
        if not source_url:
            source_url = default_source

        # Set default modes for auto-sync
        select_mode = '1'
        import_mode = '1'
        cover_image_url = ""
        cover_path = default_cover if default_cover else "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop"

    else:
        # Full manual path
        # 1. API Configurations
        default_api_base = "https://sop.joshuasgeneration.com"
        api_base = input(f"Enter target FOI Academy server API base [{default_api_base}]: ").strip()
        if not api_base:
            api_base = default_api_base
        api_base = api_base.rstrip('/')

        # 2. Audio Product Title (First, so we can fetch existing series)
        product_title = input("Enter Audio Product Title [Sons & Daughters Network (Private)]: ").strip()
        if not product_title:
            product_title = "Sons & Daughters Network (Private)"

        # Fetch existing products to pre-populate and check for duplicate tracks
        print("Fetching existing products from server to check for series...")
        existing_products = fetch_existing_audios(api_base)
        
        existing_product = None
        for p in existing_products:
            if p.get('title', '').strip().lower() == product_title.strip().lower():
                existing_product = p
                break

        # Initialize default values based on whether the series already exists
        existing_tracks = []
        existing_track_titles = set()
        existing_tracks_by_title = {}
        product_id = None

        if existing_product:
            product_id = existing_product.get('id')
            print(f"\n-> Found existing Audio Product series: '{product_title}' (ID: {product_id})")
            existing_tracks = existing_product.get('tracks', [])
            for t in existing_tracks:
                clean_t = t.get('title', '').strip().lower()
                existing_track_titles.add(clean_t)
                existing_tracks_by_title[clean_t] = t
            print(f"   Currently has {len(existing_tracks)} tracks registered on server.")
            
            default_artist = existing_product.get('artist', 'Apostle Joshua Iyemifokhae')
            default_description = existing_product.get('description', 'Sons & Daughters Network (Private) audio series.')
            default_category = existing_product.get('category', 'Prophetic')
            default_price = str(existing_product.get('price', 0.0))
            default_orig_price = str(existing_product.get('originalPrice', '')) if existing_product.get('originalPrice') is not None else ''
            default_cover = existing_product.get('coverUrl', '')
        else:
            print(f"\n-> No existing Audio Product found with title '{product_title}'. A new series will be created.")
            default_artist = "Apostle Joshua Iyemifokhae"
            default_description = "Sons & Daughters Network (Private) audio series."
            default_category = "Prophetic"
            default_price = "0"
            default_orig_price = ""
            default_cover = ""

        # 3. Audio Product Configuration
        artist = input(f"Artist/Speaker Name [{default_artist}]: ").strip()
        if not artist:
            artist = default_artist

        description = input(f"Description [{default_description}]: ").strip()
        if not description:
            description = default_description

        category = input(f"Category [{default_category}]: ").strip()
        if not category:
            category = default_category

        price_input = input(f"Price (NGN) [{default_price}]: ").strip()
        price = 0.0
        if price_input:
            try:
                price = float(price_input)
            except ValueError:
                pass
        elif default_price:
            price = float(default_price)

        original_price_input = input(f"Original Price (NGN) [{default_orig_price if default_orig_price else 'None'}]: ").strip()
        original_price = None
        if original_price_input:
            try:
                original_price = float(original_price_input)
            except ValueError:
                pass
        elif default_orig_price:
            original_price = float(default_orig_price)

        # 4. Source URL
        default_source = "https://joshuasgeneration.net/latest-sermons/"
        source_url = input(f"Enter WordPress RSS Feed or Listing page URL [{default_source}]: ").strip()
        if not source_url:
            source_url = default_source

    # 5. Crawl / Scrape
    items = []
    try:
        if "feed" in source_url.lower() or source_url.endswith(".xml"):
            items = parse_rss_feed(source_url)
        else:
            items = parse_html_page(source_url)
            if not items:
                try:
                    items = parse_rss_feed(source_url)
                except:
                    pass
    except Exception as e:
        print(f"Error parsing source: {e}")
        try:
            items = parse_html_page(source_url)
        except Exception as e2:
            print(f"Fallback parsing also failed: {e2}")

    if not items:
        print("\nNo audio items could be found at the source.")
        return

    print(f"\nFound {len(items)} audio tracks in WordPress blog:")
    for idx, item in enumerate(items):
        clean_title = item['title'].strip().lower()
        if clean_title in existing_track_titles:
            status_tag = "[Already Uploaded - Will Skip]"
        else:
            status_tag = "[NEW]"
        print(f"  [{idx+1}] {item['title']} {status_tag}")
        print(f"      Source MP3: {item['audioUrl'][:80]}...")

    # 6. Selection
    selected_items = []
    if op_choice == '1':
        select_mode = '1'
        selected_items = items
    else:
        print("\nHow would you like to select tracks for the series?")
        print("  [1] Add/Keep ALL tracks (skips download for already uploaded ones)")
        print("  [2] Select interactively")
        select_mode = input("Choose mode [1]: ").strip()
        if select_mode not in ['1', '2']:
            select_mode = '1'

        for idx, item in enumerate(items):
            clean_title = item['title'].strip().lower()
            if select_mode == '1':
                selected_items.append(item)
            else:
                if clean_title in existing_track_titles:
                    prompt_msg = f"  Keep '{item['title']}' (already uploaded)? (y/n/stop) [y]: "
                else:
                    prompt_msg = f"  Add new track '{item['title']}'? (y/n/stop) [y]: "
                confirm = input(prompt_msg).strip().lower()
                if confirm == 'stop':
                    break
                if confirm == 'y' or confirm == '':
                    selected_items.append(item)

    if not selected_items:
        print("No tracks selected. Exiting.")
        return

    # 7. Mode: Direct Link vs Download+Upload
    if op_choice == '1':
        import_mode = '1'
    else:
        print("\nImport Mode:")
        print("  [1] DOWNLOAD+UPLOAD — Download files locally and re-upload to FOI Academy server (Recommended)")
        print("  [2] DIRECT LINK — Link to WordPress URLs directly (Fast, no downloading)")
        import_mode = input("Select mode [1]: ").strip()
        if import_mode not in ['1', '2']:
            import_mode = '1'

    # 8. Upload Product Cover Image (optional)
    cover_path = default_cover if (op_choice == '1' and 'default_cover' in locals() and default_cover) else ""
    if op_choice != '1':
        cover_image_url = ""
        if not existing_product:
            cover_image_url = input("\nEnter Cover Image URL for the Audio Product [Optional]: ").strip()
            if not cover_image_url and selected_items[0].get('imageUrl'):
                cover_image_url = selected_items[0].get('imageUrl')
                print(f"Using first track's image as product cover: {cover_image_url}")

        if cover_image_url:
            if import_mode == '1':
                print("Downloading and uploading cover image...")
                parsed_img = urllib.parse.urlparse(cover_image_url)
                img_name = os.path.basename(parsed_img.path)
                if not img_name or '.' not in img_name:
                    img_name = "cover.jpg"
                temp_img_path = os.path.join(os.getcwd(), f"temp_{img_name}")
                try:
                    download_file(cover_image_url, temp_img_path)
                    res_url = upload_file_to_platform(api_base, temp_img_path, img_name, "image")
                    if res_url:
                        cover_path = res_url
                        print(f"Cover uploaded successfully: {cover_path}")
                except Exception as e:
                    print(f"Failed to process cover image: {e}")
                finally:
                    if os.path.exists(temp_img_path):
                        os.remove(temp_img_path)
            else:
                cover_path = cover_image_url

    if not cover_path:
        cover_path = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=400&fit=crop"

    # 9. Process Tracks (Skipping already uploaded tracks)
    tracks = []
    total_seconds = 0

    # Initialize tracks with ALL existing tracks if product already exists
    if existing_product:
        print(f"Initializing series with {len(existing_tracks)} existing tracks from server...")
        for t in existing_tracks:
            tracks.append({
                'title': t.get('title'),
                'url': t.get('url'),
                'duration': t.get('duration', '45:00')
            })
            total_seconds += parse_duration_to_seconds(t.get('duration', '45:00'))

    print(f"\nProcessing {len(selected_items)} tracks from the crawled source...")
    new_tracks_count = 0
    for idx, item in enumerate(selected_items):
        clean_title = item['title'].strip().lower()
        
        # Check if already uploaded
        if clean_title in existing_track_titles:
            print(f"\n[{idx+1}/{len(selected_items)}] SKIPPING — '{item['title']}' already exists in the series database.")
            continue

        print(f"\n[{idx+1}/{len(selected_items)}] PROCESSING NEW TRACK — '{item['title']}'")
        track_url = ""
        duration = item.get('duration', '').strip()

        if import_mode == '2':
            # Direct link mode
            track_url = item['audioUrl']
            if not duration:
                duration = get_remote_audio_duration(track_url)
            print(f"  Using direct link: {track_url}")
        else:
            # Download & upload mode
            parsed_audio = urllib.parse.urlparse(item['audioUrl'])
            audio_filename = os.path.basename(parsed_audio.path)
            if not audio_filename.lower().endswith('.mp3'):
                audio_filename = f"track_{idx+1}.mp3"
            
            temp_audio_path = os.path.join(os.getcwd(), f"temp_{audio_filename}")
            try:
                print("  Downloading audio...")
                download_file(item['audioUrl'], temp_audio_path)
                if not duration:
                    duration = get_audio_duration(temp_audio_path)
                print(f"  Duration detected: {duration}")
                
                print("  Uploading audio to platform...")
                uploaded_url = upload_file_to_platform(api_base, temp_audio_path, audio_filename, "audio")
                if uploaded_url:
                    track_url = uploaded_url
                    print(f"  Uploaded successfully: {track_url}")
            except Exception as e:
                print(f"  Error processing track: {e}")
            finally:
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)

        if track_url:
            tracks.append({
                'title': item['title'],
                'url': track_url,
                'duration': duration if duration else "45:00"
            })
            existing_track_titles.add(clean_title)
            total_seconds += parse_duration_to_seconds(duration if duration else "45:00")
            new_tracks_count += 1
        else:
            print("  Skipped: could not get track URL.")

    # If no new tracks were added, and we already had existing tracks, ask if user still wants to republish/update
    if new_tracks_count == 0 and existing_product:
        print("\nAll tracks found in this source are already present in the existing audio product.")
        confirm_update = input("No new tracks to add. Re-save/publish anyway? (y/n) [n]: ").strip().lower()
        if confirm_update != 'y':
            print("Operation completed. No changes made.")
            return

    if not tracks:
        print("\nNo tracks to publish. Exiting.")
        return

    # 10. Save / Publish Audio Product
    total_friendly_dur = format_seconds_to_friendly(total_seconds)
    print(f"\nCompiling Audio Product payload...")
    print(f"  - Title: {product_title}")
    print(f"  - Total Tracks: {len(tracks)}")
    print(f"  - Total Duration: {total_friendly_dur}")
    print(f"  - Price: {price} NGN")

    payload = {
        "title": product_title,
        "artist": artist,
        "coverUrl": cover_path,
        "description": description,
        "category": category,
        "duration": total_friendly_dur,
        "price": price,
        "originalPrice": original_price,
        "isFeatured": True,
        "isBestseller": False,
        "tracks": tracks
    }

    try:
        res = save_audio_product(api_base, payload, product_id)
        print("\n" + "=" * 60)
        print("  AUDIO PRODUCT CREATED & PUBLISHED SUCCESSFULLY!")
        print("=" * 60)
        print(f"  ID: {res.get('id')}")
        print(f"  Title: {res.get('title')}")
        print(f"  Category: {res.get('category')}")
        print(f"  Tracks: {len(res.get('tracks', []))}")
        print("=" * 60)
    except Exception as e:
        print(f"\nFailed to save Audio Product: {e}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nOperation cancelled.")
