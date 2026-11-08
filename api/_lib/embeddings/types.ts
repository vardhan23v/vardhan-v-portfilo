export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  getDimensions(): number;
  embedText(text: string): Promise<number[]>;
  embedDocuments(texts: string[]): Promise<number[][]>;
}
