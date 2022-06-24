export type Measurement = 'g' | 'kg' | 'ml' | 'l' | 'tsp' | 'tbsp' | '';

export interface Ingredient {
  name: string;
  value: number;
  measurement: Measurement;
}

export interface Component {
  name: string;
  technique: string;
  ingredients: Ingredient[];
}

export interface Recipe {
  title: string;
  instructions: string;
  components: Component[];
}