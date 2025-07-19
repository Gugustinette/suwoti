export default class Random {
    static get(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}