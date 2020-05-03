function pluck<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
    return propertyNames.map(n => o[n])
}

interface Car {
    manufacturer: string;
    model: string;
    year: number;
}

let taxi: Car = {
    manufacturer: 'Toyota',
    model: 'Camry',
    year: 2014
};

let makeAndModel: string[] = pluck(taxi, ['manufacturer', 'model']);
let modelYear = pluck(taxi, ['model', 'year']);

function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]
}

export { pluck }
