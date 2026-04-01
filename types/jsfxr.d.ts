declare type jsfxrSound = {
    play() : void;
}

declare module "jsfxr" {
    const sfxr: {
        generate: (preset:any) => any;
        play: (sound:string) => any;
        toAudio: (synthdef:any) => jsfxrSound;
        toWave: (synthdef:any) => any;
    }
}