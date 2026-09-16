#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur d'art génératif pour Cuisine Caritative.
------------------------------------------------------------
Produit des compositions abstraites (blobs organiques + nuages de points)
dans la palette de marque, en écho à la forme de la main du logo :
des courbes continues, aucune ligne droite dure.

Ce sont des PLACEHOLDERS assumés : une fois le style validé, remplacez-les
par de vraies photos, ou régénérez des variantes avec un outil d'IA générative
d'image en conservant cette direction artistique (formes organiques, dégradés
bleu/or/vert, jamais de personnages réalistes tant que le consentement des
familles n'est pas obtenu).

Relancer : python3 generate_art.py
"""
import math
import random
import os

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'img', 'generative')
os.makedirs(OUT_DIR, exist_ok=True)

PALETTE = {
    'blue_deep':  '#1D5975',
    'blue':       '#2888BA',
    'blue_soft':  '#6EB3D4',
    'blue_pale':  '#BFE0EE',
    'gold':       '#D98A2B',
    'gold_deep':  '#B76F1B',
    'gold_soft':  '#F0C482',
    'green':      '#4C8C63',
    'green_soft': '#8CC29E',
    'sand':       '#FBF4E8',
    'ink':        '#1C1A16',
}

def blob_path(cx, cy, base_r, points, seed, wobble=0.28):
    """Génère un contour organique fermé et lisse (blob) via des courbes de Bézier
    cubiques passant approximativement par des points disposés en cercle avec un
    rayon bruité, façon Catmull-Rom -> Bézier."""
    rnd = random.Random(seed)
    pts = []
    for i in range(points):
        angle = (2 * math.pi / points) * i
        r = base_r * (1 + rnd.uniform(-wobble, wobble))
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))

    def catmull_to_bezier(p0, p1, p2, p3):
        c1 = (p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6)
        c2 = (p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6)
        return c1, c2

    n = len(pts)
    d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f} "
    for i in range(n):
        p0 = pts[(i-1) % n]; p1 = pts[i]; p2 = pts[(i+1) % n]; p3 = pts[(i+2) % n]
        c1, c2 = catmull_to_bezier(p0, p1, p2, p3)
        d += f"C {c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f} "
    d += "Z"
    return d

def dot_scatter(cx, cy, radius, n, seed, color, r_min=1.5, r_max=5, op_min=0.15, op_max=0.55):
    rnd = random.Random(seed)
    dots = []
    for _ in range(n):
        a = rnd.uniform(0, 2*math.pi)
        # densité plus forte vers le centre (distribution racine)
        d = radius * math.sqrt(rnd.uniform(0, 1))
        x = cx + d * math.cos(a)
        y = cy + d * math.sin(a)
        r = rnd.uniform(r_min, r_max)
        op = rnd.uniform(op_min, op_max)
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{color}" opacity="{op:.2f}"/>')
    return "\n".join(dots)

def svg_header(w, h, defs=""):
    return f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">\n<defs>{defs}</defs>\n'

def grad(id_, c1, c2, x1=0, y1=0, x2=1, y2=1):
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>'

def radial(id_, c1, c2, cx=0.3, cy=0.25, r=0.9):
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></radialGradient>'


def composition(seed, w=800, h=800, bg=None, blob_colors=None, dot_color='#FFFFFF', n_blobs=3, n_dots=90, watermark=False):
    rnd = random.Random(seed)
    blob_colors = blob_colors or [PALETTE['blue'], PALETTE['gold'], PALETTE['green']]
    defs = ""
    body = ""

    if bg:
        defs += radial('bg', bg[0], bg[1])
        body += f'<rect width="{w}" height="{h}" fill="url(#bg)"/>'

    for i in range(n_blobs):
        cx = w * rnd.uniform(0.25, 0.75)
        cy = h * rnd.uniform(0.25, 0.75)
        r = min(w, h) * rnd.uniform(0.28, 0.42)
        gid = f'g{seed}_{i}'
        c = blob_colors[i % len(blob_colors)]
        defs += radial(gid, c, c, cx=0.35, cy=0.3, r=1.1)
        path = blob_path(cx, cy, r, points=rnd.randint(7, 9), seed=seed*10+i, wobble=0.3)
        op = rnd.uniform(0.55, 0.85)
        body += f'<path d="{path}" fill="url(#{gid})" opacity="{op:.2f}"/>'

    body += dot_scatter(w*0.5, h*0.5, min(w,h)*0.62, n_dots, seed*7+3, dot_color)

    if watermark:
        # silhouette très discrète de la main du logo, en filigrane
        body += f'''<g opacity="0.10" transform="translate({w*0.5},{h*0.5}) scale({min(w,h)/1080:.3f}) translate(-540,-540)">
          <path fill="#fff" d="M540 180c120 0 220 90 220 210 0 40-30 70-60 40-20-20-40-70-70-90-10-10-20 0-10 20 20 40 40 90 20 130-30 60-140 90-220 60-90-30-160-110-160-220 0-90 60-160 150-170 40-4 90 10 130 20z"/>
        </g>'''

    return svg_header(w, h, defs) + body + '</svg>'


def save(name, svg):
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print('✓', name)


# ---------------------------------------------------------------
# 1) Art de la page d'accueil (hero) — grande composition signature
# ---------------------------------------------------------------
save('hero-art.svg', composition(
    seed=42, w=900, h=900,
    bg=(PALETTE['blue_soft'], PALETTE['blue_deep']),
    blob_colors=[PALETTE['gold'], PALETTE['blue_pale'], PALETTE['green_soft']],
    dot_color='#FFFFFF', n_blobs=3, n_dots=140, watermark=True,
))

# ---------------------------------------------------------------
# 2) Six tuiles de galerie / blog — compositions variées
# ---------------------------------------------------------------
tile_specs = [
    ('tile-1.svg', 11, (PALETTE['blue'],      PALETTE['blue_deep']), [PALETTE['gold'], PALETTE['blue_pale']]),
    ('tile-2.svg', 22, (PALETTE['gold'],      PALETTE['gold_deep']), [PALETTE['blue'], PALETTE['gold_soft']]),
    ('tile-3.svg', 33, (PALETTE['green'],     '#2F5F41'),            [PALETTE['gold_soft'], PALETTE['blue_pale']]),
    ('tile-4.svg', 44, (PALETTE['blue_soft'], PALETTE['blue']),      [PALETTE['green_soft'], PALETTE['gold']]),
    ('tile-5.svg', 55, (PALETTE['gold_soft'], PALETTE['gold']),      [PALETTE['blue'], PALETTE['green_soft']]),
    ('tile-6.svg', 66, (PALETTE['blue_deep'], '#122F3E'),            [PALETTE['gold'], PALETTE['blue_soft']]),
]
for fname, seed, bg, blobs in tile_specs:
    save(fname, composition(seed=seed, w=640, h=480, bg=bg, blob_colors=blobs, n_blobs=3, n_dots=60))

# ---------------------------------------------------------------
# 3) Fond pour les écrans de connexion (admin + espace donateur)
# ---------------------------------------------------------------
save('login-art.svg', composition(
    seed=77, w=1000, h=1000,
    bg=(PALETTE['blue_soft'], PALETTE['blue_deep']),
    blob_colors=[PALETTE['gold'], PALETTE['green_soft'], PALETTE['blue_pale']],
    n_blobs=4, n_dots=170, watermark=True,
))

# ---------------------------------------------------------------
# 4) Motif léger pour les séparateurs de section (répétable)
# ---------------------------------------------------------------
save('divider-dots.svg', composition(
    seed=5, w=1200, h=200, bg=None,
    blob_colors=[PALETTE['blue']], n_blobs=0, n_dots=70, dot_color=PALETTE['blue'],
))

print('\nTerminé — SVG dans assets/img/generative/')
