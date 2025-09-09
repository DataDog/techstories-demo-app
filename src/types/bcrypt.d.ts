declare module "bcrypt" {
  function compare(data: string, encrypted: string): Promise<boolean>;
  function hash(data: string, saltOrRounds: number): Promise<string>;
}
