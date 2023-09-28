export abstract class Entity<TType> {
  public initialState: TType;
  public props: TType;

  constructor(data: TType) {
    this.initialState = { ...data };
    this.props = { ...data };

    Object.freeze(this.initialState);
  }

  update(data: Partial<TType>): void {
    this.props = { ...this.props, ...data };
  }

  commit(): void {
    this.initialState = this.props;
  }

  clone() {
    return new (this.constructor as any)(this.props);
  }
}
