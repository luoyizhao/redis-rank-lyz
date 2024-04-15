export class Err extends Error {
  public code: string | number = -1
  constructor(params: { message?: string, code?: string | number }) {
    super(params.message)
    if(params.code) this.code = params.code
  }
}