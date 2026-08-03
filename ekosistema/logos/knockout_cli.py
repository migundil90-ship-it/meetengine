from PIL import Image
import sys
from collections import Counter

def corner_bg(im):
    w,h=im.size
    pts=[(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]
    px=[im.getpixel(p)[:3] for p in pts]
    c=Counter(px).most_common(1)[0][0]
    return c

def knockout(src,dst,tol=60,soft=40):
    im=Image.open(src).convert("RGBA")
    bg=corner_bg(im)
    data=im.getdata()
    br,bgc,bb=bg
    out=[]
    for r,g,b,a in data:
        d=((r-br)**2+(g-bgc)**2+(b-bb)**2)**0.5
        if d<=tol:
            out.append((r,g,b,0))
        elif d<=tol+soft:
            na=int(255*(d-tol)/soft)
            out.append((r,g,b,min(a,na)))
        else:
            out.append((r,g,b,a))
    im.putdata(out)
    bbox=im.getbbox()
    if bbox: im=im.crop(bbox)
    im.save(dst)
    return im.size, bg

if __name__=="__main__":
    src=sys.argv[1]; dst=sys.argv[2]
    tol=int(sys.argv[3]) if len(sys.argv)>3 else 60
    sz,bg=knockout(src,dst,tol)
    print("OK",dst,sz,"bg=",bg)
