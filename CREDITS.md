# Crédits et licences

Mymarketing s'appuie sur ces projets (installés par `installer.sh`, non copiés dans ce dépôt sauf mention) :

| Composant | Rôle | Licence |
|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen) | Rendu HTML → MP4, contrôle, storyboard, voix (TTS) | Apache 2.0 |
| [GSAP](https://github.com/greensock/GSAP) | Animation | Licence standard GreenSock « no charge » (usage commercial gratuit) |
| [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) via kokoro-onnx | Voix française locale (`ff_siwis`) | Apache 2.0 (modèle), MIT (kokoro-onnx) |
| [Inter](https://rsms.me/inter/) et [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (Fontsource) | Polices | SIL Open Font License 1.1 |
| [Simple Icons](https://simpleicons.org) | Logos de technologies (`si:graphql`…) | CC0 1.0 ; les logos restent des marques de leurs propriétaires |
| [puppeteer-core](https://github.com/puppeteer/puppeteer) | Captures d'écran web | Apache 2.0 |
| FFmpeg | Mixage audio, encodage | LGPL/GPL (installé sur le système) |

Idées et méthodes reprises (réécrites, pas copiées) :
- [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) (MIT) : principes de mouvement (`skills/mymarketing/references/motion.md`).
- [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT) : boucle d'auto-revue en images fixes, son masterisé à −14 LUFS.
- [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) (MIT) : synchronisation des animations sur les mots de la voix.
- [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) (MIT) : charte lue avant chaque vidéo, règle « aucun fait inventé ».
- [t3knobox/klik-anim-skill-creation](https://github.com/t3knobox/klik-anim-skill-creation) : storyboard validé en images fixes avant le rendu (idée seulement).

Musique : aucune piste n'est fournie. Le fond généré (`moteur/audio/sons.py`) est original. Les pistes que tu ajoutes gardent leur propre licence.
