export enum Scale {
    Major = 'major',
    Minor = 'minor',
}

export interface Key {
    scale: Scale
    rootNote: string
}
