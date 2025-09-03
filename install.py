import os, sys, urllib.request, shutil

FILES = {
  'https://code.jquery.com/jquery-3.6.0.min.js': 'libs/jquery-3.6.0.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.12.0/chess.min.js': 'libs/chess.min.js',
  'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js': 'libs/chessboard-1.0.0.min.js',
  'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css': 'libs/chessboard-1.0.0.min.css'
}

IMAGES = [
  'bk.png','bq.png','br.png','bb.png','bn.png','bp.png',
  'wk.png','wq.png','wr.png','wb.png','wn.png','wp.png'
]

def ensure_dir(p):
  d = os.path.dirname(p)
  if d and not os.path.exists(d):
    os.makedirs(d)

def download(url, path):
  try:
    print('Downloading', url)
    ensure_dir(path)
    with urllib.request.urlopen(url) as r, open(path, 'wb') as f:
      shutil.copyfileobj(r, f)
    print('Saved', path)
  except Exception as e:
    print('Failed to download', url, e)
    return False
  return True

def main():
  for url, path in FILES.items():
    ok = download(url, path)
    if not ok:
      print('One of the files failed. You can try again or download manually.')
  # images
  base = 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/img/chesspieces/wikipedia/'
  for im in IMAGES:
    url = base + im
    path = os.path.join('libs','img','chesspieces','wikipedia',im)
    download(url, path)
  print('Done. Open index.html in your browser.')

if __name__ == '__main__':
  main()
