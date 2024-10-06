export class CreatePlaceDto {
    readonly categoryIds: string[];
    readonly name: string;
    readonly coordinates: [number, number];
    readonly description: string;
    readonly audio: string;
    readonly reviews: string[];
    readonly ratings: number[];
    readonly photos: string[];
  }
  