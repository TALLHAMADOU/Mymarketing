"""Génère les sons de secours de Mymarketing : un fond musical et une piste d'effets.

Usage : python3 sons.py plan.json
plan.json : {"duree": 58.2, "humeur": "tech", "bpm": 100, "transitions": [3.1, 9.8], "apparitions": [1.2, 4.0],
             "fond": "audio/fond-genere.wav", "sfx": "audio/sfx.wav", "graine": 7}

Le fond généré sert quand aucune musique n'est fournie (bibliothèque vide, pas d'internet).
Il est volontairement discret : accords doux, arpège, basse, rythme léger. Tout est déterministe (graine).
"""

import json
import sys
import wave

import numpy as np

SR = 48000

# Progressions (fréquences des fondamentales) par humeur.
NOTES = {"A2": 110.0, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F2": 87.31, "F3": 174.61, "G2": 98.0, "G3": 196.0,
         "A3": 220.0, "B3": 246.94, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0,
         "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25}
ACCORDS = {
    "Am": ["A3", "C4", "E4"], "F": ["F3", "A3", "C4"], "C": ["C4", "E4", "G4"], "G": ["G3", "B3", "D4"],
    "Dm": ["D4", "F4", "A4"], "Em": ["E4", "G4", "B4"],
}
BASSES = {"Am": "A2", "F": "F2", "C": "C3", "G": "G2", "Dm": "D3", "Em": "E3"}
HUMEURS = {
    "tech": {"suite": ["Am", "F", "C", "G"], "bpm": 100, "rythme": 1.0},
    "positive": {"suite": ["C", "G", "Am", "F"], "bpm": 108, "rythme": 1.0},
    "calme": {"suite": ["F", "C", "Dm", "Am"], "bpm": 84, "rythme": 0.4},
    "energique": {"suite": ["Am", "G", "F", "G"], "bpm": 120, "rythme": 1.3},
}


def ecrire(chemin, gauche, droite):
    st = np.stack([gauche, droite], axis=1)
    st = np.clip(st, -1, 1)
    with wave.open(chemin, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())


def enveloppe(n, attaque, decroissance):
    t = np.arange(n) / SR
    env = np.minimum(1.0, t / max(attaque, 1e-4)) * np.exp(-t / decroissance)
    return env


def ton(freq, n, harmoniques=(1.0, 0.35, 0.15), desaccord=0.0, phase=0.0):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k, a in enumerate(harmoniques, start=1):
        s += a * np.sin(2 * np.pi * (freq * k + desaccord) * t + phase * k)
    return s


def passe_bas(x, coupure):
    # Filtre passe-bas d'ordre 1 (simple, stable).
    a = np.exp(-2 * np.pi * coupure / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):  # boucle courte : utilisée seulement sur des sons brefs
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def fond(duree, humeur, bpm, rng):
    h = HUMEURS.get(humeur, HUMEURS["tech"])
    bpm = bpm or h["bpm"]
    n = int(duree * SR)
    G = np.zeros(n)
    D = np.zeros(n)
    temps = 60.0 / bpm
    mesure = 4 * temps
    suite = h["suite"]
    nb_mesures = int(np.ceil(duree / mesure)) + 1

    def poser(sig, t, gain_g, gain_d):
        i0 = int(t * SR)
        if i0 >= n:
            return
        m = min(len(sig), n - i0)
        G[i0:i0 + m] += sig[:m] * gain_g
        D[i0:i0 + m] += sig[:m] * gain_d

    bruit_hat = rng.standard_normal(int(0.05 * SR))
    bruit_hat = np.diff(bruit_hat, prepend=0.0)  # passe-haut grossier
    for m in range(nb_mesures):
        acc = suite[m % len(suite)]
        t0 = m * mesure
        # Nappe : accord tenu, attaque lente, légèrement désaccordé gauche/droite.
        nn = int((mesure + 0.4) * SR)
        env = np.minimum(1, np.arange(nn) / (0.35 * SR)) * np.minimum(1, (nn - np.arange(nn)) / (0.4 * SR))
        for note in ACCORDS[acc]:
            f = NOTES[note]
            poser(ton(f, nn, (1.0, 0.18), -0.7) * env * 0.055, t0, 1.0, 0.75)
            poser(ton(f, nn, (1.0, 0.18), +0.7) * env * 0.055, t0, 0.75, 1.0)
        # Basse : fondamentale sur les temps 1 et 3.
        fb = NOTES[BASSES[acc]]
        for b in (0, 2):
            nb = int(temps * 1.6 * SR)
            poser(ton(fb, nb, (1.0, 0.25)) * enveloppe(nb, 0.01, 0.45) * 0.16, t0 + b * temps, 1, 1)
        # Arpège en croches (pincé).
        notes_arp = ACCORDS[acc] + [ACCORDS[acc][1]]
        for k in range(8):
            f = NOTES[notes_arp[k % len(notes_arp)]] * 2
            na = int(0.45 * SR)
            pan = 0.35 * np.sin(k * 0.9)
            poser(ton(f, na, (1.0, 0.3, 0.08)) * enveloppe(na, 0.004, 0.13) * 0.045, t0 + k * temps / 2, 1 - pan, 1 + pan)
        # Rythme léger : grosse caisse sur les temps, charleston sur les contretemps.
        if h["rythme"] > 0:
            for b in range(4):
                nk = int(0.28 * SR)
                tk = np.arange(nk) / SR
                freq = 45 + 75 * np.exp(-tk / 0.035)
                kick = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tk / 0.11)
                poser(kick * 0.22 * h["rythme"], t0 + b * temps, 1, 1)
                hat = bruit_hat * enveloppe(len(bruit_hat), 0.001, 0.012)
                poser(hat * 0.035 * h["rythme"], t0 + b * temps + temps / 2, 0.8, 1.0)

    # Entrée et sortie en fondu.
    fi = int(min(1.5, duree / 4) * SR)
    fo = int(min(2.5, duree / 4) * SR)
    rampe = np.ones(n)
    rampe[:fi] = np.linspace(0, 1, fi)
    rampe[n - fo:] = np.linspace(1, 0, fo)
    return G * rampe, D * rampe


def effets(duree, transitions, apparitions, rng):
    n = int(duree * SR)
    G = np.zeros(n)
    D = np.zeros(n)

    def poser(sig, t, pan=0.0, gain=1.0):
        i0 = int(t * SR)
        if i0 < 0 or i0 >= n:
            return
        m = min(len(sig), n - i0)
        G[i0:i0 + m] += sig[:m] * gain * (1 - pan) / 2 * 2 ** 0.5
        D[i0:i0 + m] += sig[:m] * gain * (1 + pan) / 2 * 2 ** 0.5

    # Souffle (whoosh) : bruit filtré dont la "brillance" monte puis redescend, centré sur la transition.
    for i, t in enumerate(transitions):
        dur = 0.55
        nw = int(dur * SR)
        bruit = rng.standard_normal(nw)
        x = np.linspace(0, 1, nw)
        forme = np.sin(np.pi * x ** 0.7) ** 2
        lisse = passe_bas(bruit, 2200) * 0.6 + passe_bas(bruit, 600) * 0.4
        poser(lisse * forme * 0.32, t - dur * 0.55, pan=(-0.3 if i % 2 else 0.3))
    # Petit "pop" accordé quand un élément apparaît (discret).
    notes = [NOTES["A4"], NOTES["C5"], NOTES["E5"], NOTES["D5"]]
    for i, t in enumerate(apparitions):
        npop = int(0.12 * SR)
        tt = np.arange(npop) / SR
        f = notes[i % len(notes)] * (1 + 0.6 * np.exp(-tt / 0.02))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.035)
        poser(s * 0.10, t, pan=0.0)
    return G, D


def main():
    plan = json.load(open(sys.argv[1], encoding="utf-8"))
    rng = np.random.default_rng(plan.get("graine", 7))
    duree = float(plan["duree"]) + 0.5
    if plan.get("fond"):
        g, d = fond(duree, plan.get("humeur", "tech"), plan.get("bpm"), rng)
        pic = max(np.abs(g).max(), np.abs(d).max()) or 1
        ecrire(plan["fond"], g / pic * 0.7, d / pic * 0.7)
    if plan.get("sfx"):
        g, d = effets(duree, plan.get("transitions", []), plan.get("apparitions", []), rng)
        pic = max(np.abs(g).max(), np.abs(d).max(), 1e-6)
        k = min(1.0, 0.9 / pic)
        ecrire(plan["sfx"], g * k, d * k)


if __name__ == "__main__":
    main()
