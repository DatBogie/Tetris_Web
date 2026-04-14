declare type jsfxrSound = {
    play() : void;
    volume:number;
}

declare module "jsfxr" {
    const sfxr: {
        generate: (preset:any) => any;
        play: (sound:string) => any;
        toAudio: (synthdef:any) => jsfxrSound;
        toWave: (synthdef:any) => any;
    }
}